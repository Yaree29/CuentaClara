// Pyme Dashboard
import React, {useState,useCallback,useMemo,useEffect,} from "react";
import {View,Text,ScrollView,RefreshControl,TouchableOpacity,} from "react-native";
import {ExclamationTriangleIcon,TrophyIcon,BoltIcon,ChartBarIcon,} from "react-native-heroicons/outline";
import styles from "./styles/PymeDashboards.styles";
import colors from "../../../theme/colors";
import useAuthStore from "../../../store/useAuthStore";
import useBlueprintStore from "../../../store/useBlueprintStore";
import useSalesStore from "../../../store/useSaleStore";
import useDashboardData from "../hooks/useDashboardData";
import SummaryCard from "./shared/SummaryCard";
import AlertCard from "./shared/AlertCard";
import GoalProgressCard from "./shared/GoalProgressCard";
import QuickActions from "./shared/QuickActions";
import DashboardGreeting from "./shared/DashboardGreeting";
import { buildDashboard } from "../engine/dashboardEngine";

const PymeDashboard = () => {

  const user = useAuthStore((state) => state.user);
  const preferences = useAuthStore((state) => state.preferences) || {};
  const {business,config,loading,reload,} = useDashboardData();
  const businessData = business || {};
  const enabledModules = useBlueprintStore((state) => state.modules );
  const dailySales = useSalesStore( (state) => state.dailySales );
  const expenses = useSalesStore((state) => state.expenses );
  const generalMovements = useSalesStore((state) => state.generalMovements );
  const currency = config?.currency || "USD";
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const [todayIncome, setTodayIncome] = useState(0);

  useEffect(() => {
    const income = dailySales.reduce(
      (total, sale) => total + (Number(sale.total) || 0),
      0
    );
    setTodayIncome(income);
  }, [dailySales]);

  const dashboard = useMemo(() => {

    return buildDashboard({
      user,
      businessData: {
        ...businessData,
        enabled_modules: enabledModules,
        currency,
      },
      preferences,
      dailySales,
      expenses,
      generalMovements,
    });
  }, [user,businessData,enabledModules,currency,preferences,dailySales,expenses,generalMovements,]);

  const {header,summary,alerts,goals,quickActions,finance,modules,activity,business: businessInfo,status,} = dashboard;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <DashboardGreeting todayIncome={todayIncome} />

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {header.role === "administrator"
              ? "Administrador"
              : "Asistente"}
          </Text>
        </View>
      </View>

      {/*separacion*/}

      <Text style={styles.sectionTitle}>
        Resumen del Negocio
      </Text>

      <View style={styles.summaryGrid}>
        {summary.map((card, index) => {
          const isOdd = summary.length % 2 !== 0;
          const isLast = index === summary.length - 1;
          const isSingleLast = isOdd && isLast;

          return (
            <View
              key={card.id}
              style={[
                styles.cardWrapper,
                isSingleLast && styles.cardWrapperCentered,
              ]}
            >
              <SummaryCard
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                color={card.color}
                type={
                  typeof card.value === "number" &&
                  (card.id === "sales" || card.id === "cash")
                    ? "currency"
                    : "number"
                }
              />
            </View>
          );
        })}
      </View>

      {/*separacion*/}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <ExclamationTriangleIcon
            size={20}
            color={colors.warning}
          />

          <Text style={styles.sectionTitle}>
            Alertas Operativas
          </Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.seeMoreText}>
            Ver todas
          </Text>
        </TouchableOpacity>
      </View>

      {alerts.length > 0 ? (
        alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            title={alert.title}
            description={alert.description}
            severity={alert.severity}
            module={alert.module}
            icon={alert.icon}
          />
        ))
      ) : (
        <View style={styles.emptyCard}>
          <ExclamationTriangleIcon
            size={35}
            color={colors.success}
          />

          <Text style={styles.emptyTitle}>
            No existen alertas
          </Text>

          <Text style={styles.emptySubtitle}>
            Todos los módulos activos se
            encuentran funcionando correctamente.
          </Text>
        </View>
      )}

      {/*separacion*/}

      <View style={styles.goalContainer}>
        <View style={styles.sectionTitleContainer}>
          <TrophyIcon
            size={20}
            color={colors.warning}
          />

          <Text style={styles.sectionTitle}>
            Meta Mensual
          </Text>
        </View>

        <GoalProgressCard
          current={goals.current}
          target={goals.target}
          percentage={goals.percentage}
        />
      </View>

      {/*separacion*/}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <BoltIcon
            size={20}
            color={colors.primary}
          />

          <Text style={styles.sectionTitle}>
            Acciones Rápidas
          </Text>
        </View>
      </View>
      <QuickActions actions={quickActions} />

      {/*separacion*/}

      <Text style={styles.sectionTitle}>Estado General</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ChartBarIcon
              size={22}
              color={colors.primary}
            />

            <Text style={styles.infoTitle}>
              Rendimiento
            </Text>
          </View>

          <Text style={styles.infoValue}>
            {(Number(goals.percentage) || 0).toFixed(0)}%
          </Text>

          <Text style={styles.infoSubtitle}>
            Avance respecto a la meta mensual.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <ChartBarIcon
              size={22}
              color={colors.success}
            />

            <Text style={styles.infoTitle}>
              Caja Disponible
            </Text>
          </View>

          <Text style={styles.infoValue}>
            ${(Number(finance.balance) || 0).toFixed(2)}
          </Text>

          <Text style={styles.infoSubtitle}>
            Balance actualizado de la jornada.
          </Text>
        </View>
      </View>

      {/*separacion*/}

      <Text style={styles.sectionTitle}>
        Módulos Activos
      </Text>   
      <View style={styles.modulesContainer}>
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <View
              key={module.id}
              style={styles.moduleCard}
            >
              <View
                style={styles.moduleIconContainer}
              >
                <Icon
                  size={26}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.moduleTitle}
                numberOfLines={2}
              >
                {module.title}
              </Text>
            </View>
          );
        })}
      </View>

      {/*separacion*/}

      <Text style={styles.sectionTitle}>
        Resumen Financiero
      </Text>
      <View style={styles.financesContainer}>
        <View style={styles.financeCard}>
          <Text style={styles.financeLabel}>
            Ventas
          </Text>

          <Text
            style={[
              styles.financeValue,
              { color: colors.success },
            ]}
          >
            ${(Number(finance.sales) || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.financeCard}>
          <Text style={styles.financeLabel}>
            Gastos
          </Text>

          <Text
            style={[
              styles.financeValue,
              { color: colors.danger },
            ]}
          >
            ${(Number(finance.expenses) || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.financeCard}>
          <Text style={styles.financeLabel}>
            Balance
          </Text>

          <Text
            style={[
              styles.financeValue,
              {
                color:
                  (Number(finance.balance) || 0) >= 0
                    ? colors.success
                    : colors.danger,
              },
            ]}
          >
            ${(Number(finance.balance) || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/*separacion*/}

      <Text style={styles.sectionTitle}>
        Actividad del Día
      </Text>
      <View style={styles.activityContainer}>
        <View style={styles.activityItem}>
          <Text style={styles.activityNumber}>
            {activity.sales}
          </Text>

          <Text style={styles.activityLabel}>
            Ventas realizadas
          </Text>
        </View>

        <View style={styles.activityDivider} />

        <View style={styles.activityItem}>
          <Text style={styles.activityNumber}>
            {activity.expenses}
          </Text>

          <Text style={styles.activityLabel}>
            Gastos registrados
          </Text>
        </View>

        <View style={styles.activityDivider} />

        <View style={styles.activityItem}>
          <Text style={styles.activityNumber}>
            {activity.movements}
          </Text>

          <Text style={styles.activityLabel}>
            Movimientos
          </Text>
        </View>
      </View>

    </ScrollView>
  );
};

export default PymeDashboard;