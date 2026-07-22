// Pyme Dashboard
import React, {useState,useCallback,useMemo,useEffect,} from "react";
import {View,Text,ScrollView,RefreshControl,TouchableOpacity,} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {ExclamationTriangleIcon,ArrowTrendingDownIcon,} from "react-native-heroicons/outline";
import styles from "./styles/PymeDashboards.styles";
import colors from "../../../theme/colors";
import useAuthStore from "../../../store/useAuthStore";
import useBlueprintStore from "../../../store/useBlueprintStore";
import useSalesStore from "../../../store/useSaleStore";
import useDashboardData from "../hooks/useDashboardData";
import salesService from "../../sales/services/salesService";
import SummaryCard from "./shared/SummaryCard";
import AlertCard from "./shared/AlertCard";
import QuickActions from "./shared/QuickActions";
import { buildDashboard } from "../engine/dashboardEngine";
import { formatMoney } from "../helpers/currency";

// Íconos por tipo de evento en "Actividad del Día" (mismo criterio que el
// ActivitySection huérfano, sin traer el componente completo).
const ACTIVITY_ICONS = {
  sale: "🛒",
  expense: "💸",
  movement: "📊",
};

const todayISO = () => new Date().toISOString().split("T")[0];

// Tarjetas secundarias del Resumen cuyo valor es moneda (Órdenes, si aparece,
// se muestra como número — igual que antes en buildSummaryCards).
const SECONDARY_CURRENCY_IDS = ["cash", "expenses"];

const PymeDashboard = ({ onTodayIncomeChange } = {}) => {

  const user = useAuthStore((state) => state.user);
  const preferences = useAuthStore((state) => state.preferences) || {};
  const {business,config,inventoryAlerts,loading,reload,} = useDashboardData();
  const businessData = business || {};
  const enabledModules = useBlueprintStore((state) => state.modules );
  const dailySales = useSalesStore( (state) => state.dailySales );
  const expenses = useSalesStore((state) => state.expenses );
  const generalMovements = useSalesStore((state) => state.generalMovements );
  const dailyTotals = useSalesStore((state) => state.dailyTotals);
  const setDailyTotals = useSalesStore((state) => state.setDailyTotals);
  const currency = config?.currency || "USD";
  const [refreshing, setRefreshing] = useState(false);

  // Totales reales del día (agregados, no lista de eventos — ver
  // useSaleStore.js) desde GET /sales/profits. Se pide al montar Home y cada
  // vez que Home gana foco (mismo patrón que AssistantDashboard.jsx).
  const fetchDailyTotals = useCallback(async () => {
    const today = todayISO();
    try {
      const data = await salesService.getProfitsAndExpenses(today, today);
      setDailyTotals(data);
    } catch {
      // Sin conexión, o rol sin permiso (require_role owner/admin en
      // /sales/profits) — se mantiene el último total conocido y
      // dashboardEngine cae de vuelta a sumar la sesión local.
    }
  }, [setDailyTotals]);

  // ── Meta mensual ───────────────────────────────────────────────────────────
  // Solo lectura: la meta se configura en Perfil > Ajustes de Negocio > Meta
  // Mensual. Aquí únicamente se mide el avance para el banner de "Ventas del
  // Día". Se declara ANTES de los callbacks que lo usan (fetchMonthIncome,
  // onRefresh): declararlo después dejaba la referencia en zona muerta temporal
  // al evaluarse los arrays de dependencias durante el render.
  const [monthIncome, setMonthIncome] = useState(0);

  // Acumulado del MES (1 del mes → hoy), para medir la meta mensual. Es una
  // consulta aparte de la del día: /sales/profits acepta rango.
  const fetchMonthIncome = useCallback(async () => {
    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    try {
      const data = await salesService.getProfitsAndExpenses(firstDay, todayISO());
      setMonthIncome(Number(data?.income) || 0);
    } catch {
      // Sin conexión o rol sin permiso: se conserva el último valor conocido.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDailyTotals();
      fetchMonthIncome();
    }, [fetchDailyTotals, fetchMonthIncome])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([reload(), fetchDailyTotals(), fetchMonthIncome()]);
    } finally {
      setRefreshing(false);
    }
  }, [reload, fetchDailyTotals, fetchMonthIncome]);


  const [todayIncome, setTodayIncome] = useState(0);

  useEffect(() => {
    if (dailyTotals) {
      setTodayIncome(dailyTotals.income);
      return;
    }
    const income = dailySales.reduce(
      (total, sale) => total + (Number(sale.total) || 0),
      0
    );
    setTodayIncome(income);
  }, [dailySales, dailyTotals]);

  // Reporta el ingreso del día hacia arriba (HomeScreen.jsx) — ahí lo usa el
  // saludo de DashboardHeader.jsx (showGreeting), que vive fuera de este
  // ScrollView.
  useEffect(() => {
    onTodayIncomeChange?.(todayIncome);
  }, [todayIncome, onTodayIncomeChange]);

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
      dailyTotals,
      inventory: inventoryAlerts,
      // recipes/services: sin fuente de datos real conectada todavía (ver
      // auditoría — no hay endpoint agregado de "recetas sin insumos" ni de
      // servicios pendientes/atrasados). Se pasan en 0 explícito para que
      // buildAlertRules no falle por undefined, no porque ya estén conectadas.
      recipes: { missingIngredients: 0, limitedProduction: 0 },
      services: { pending: 0, late: 0 },
    });
  }, [user,businessData,enabledModules,currency,preferences,dailySales,expenses,generalMovements,dailyTotals,inventoryAlerts,]);

  // `goals` (buildGoal) ya no se usa para pintar: comparaba las ventas del día
  // contra una meta mensual inventada. La meta real se calcula más abajo con
  // el acumulado del mes y el objetivo guardado por el dueño.
  const {header,summary,alerts,quickActions,finance,activity,} = dashboard;

  // Resumen: hero oscuro (Ventas del día, mismo lenguaje visual que el hero
  // "Ventas del Día" de InformalDashboard.styles.js) con el % de meta como
  // barra integrada, + fila secundaria (Caja Disponible, Gastos, y Órdenes
  // si aplica). "Movimientos" ya no se repite aquí: es un conteo de sesión
  // (generalMovements.length) y "Actividad del Día" (más abajo) ya lista esos
  // mismos eventos uno por uno — mostrar además el total sería redundante.
  const salesCard = summary.find((card) => card.id === "sales");
  const cashCard = summary.find((card) => card.id === "cash");
  const ordersCard = summary.find((card) => card.id === "orders");

  // ── Meta mensual (real) ────────────────────────────────────────────────────
  // buildGoal() comparaba las ventas de HOY contra un objetivo MENSUAL, y usaba
  // un tope inventado de 10.000 cuando no había meta configurada (además nunca
  // llegaba a leerla: `settings` no se pasaba dentro de businessData). Aquí se
  // calcula con lo acumulado del mes y con la meta que el dueño eligió en
  // Perfil > Ajustes de Negocio > Meta Mensual. Si no hay meta, no se finge
  // ninguna: el banner simplemente no muestra barra de progreso.
  const monthlyGoal = Number(config?.settings?.monthlyGoal) || 0;
  const hasGoal = monthlyGoal > 0;

  const goalPercentage = hasGoal
    ? Math.min(Math.max((monthIncome / monthlyGoal) * 100, 0), 100)
    : 0;

  const secondaryCards = useMemo(() => {
    const cards = [];
    if (cashCard) cards.push(cashCard);
    cards.push({
      id: "expenses",
      title: "Gastos",
      value: Number(finance.expenses) || 0,
      subtitle: "Registrados hoy",
      icon: ArrowTrendingDownIcon,
    });
    if (ordersCard) cards.push(ordersCard);
    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashCard, ordersCard, finance]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
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
      {/*Banner resumen*/}
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Ventas del Día</Text>
        <Text style={styles.heroAmount}>
          {formatMoney(salesCard?.value || 0, currency)}
        </Text>
        <Text style={styles.heroSubtext}>
          {salesCard?.subtitle || "Ventas del día"}
        </Text>

        {hasGoal ? (
          <>
            <View style={styles.heroProgressTrack}>
              <View
                style={[
                  styles.heroProgressFill,
                  { width: `${goalPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.heroProgressLabel}>
              {Math.round(goalPercentage)}% de la meta mensual
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.summaryGrid}>
        {secondaryCards.map((card) => (
          <View key={card.id} style={styles.cardWrapper}>
            <SummaryCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              type={SECONDARY_CURRENCY_IDS.includes(card.id) ? "currency" : "number"}
            />
          </View>
        ))}
      </View>

      {/*separacion*/}

      {/* 3. Alertas Operativas */}
      <View style={styles.alertsBlock}>
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
      </View>

      {/* 4. Acciones Rápidas — inmediatamente accionable tras ver cifras/alertas.
          Encabezado único: QuickActions ya envuelve esto en DashboardCard con
          su propio título "Acciones rápidas". */}
      <QuickActions actions={quickActions} />

      {/*separacion*/}

      {/* La "Meta Mensual" ya no se configura ni se grafica aquí: se movió a
          Perfil > Ajustes de Negocio > Meta Mensual (MonthlyGoalScreen). En el
          dashboard queda solo su REPRESENTACIÓN, dentro del banner de "Ventas
          del Día" de arriba. */}

      {/* 6. Actividad del Día */}
      <Text style={styles.sectionTitle}>
        Actividad del Día
      </Text>
      <View style={styles.activityListContainer}>
        {/* activity es el array de eventos {id,type,title,description,...}
            que arma buildActivity() — antes se leía como si fuera un objeto
            con .sales/.expenses/.movements, que siempre era undefined. */}
        {activity.length > 0 ? (
          activity.slice(0, 5).map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.activityRow,
                index === Math.min(activity.length, 5) - 1 && styles.activityRowLast,
              ]}
            >
              <View style={styles.activityIconWrap}>
                <Text style={styles.activityIconText}>
                  {ACTIVITY_ICONS[item.type] || "📌"}
                </Text>
              </View>

              <View style={styles.activityInfo}>
                <Text style={styles.activityItemTitle}>{item.title}</Text>
                {!!item.description && (
                  <Text style={styles.activityItemDescription}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.activityEmptyText}>
            Sin actividad registrada en esta sesión.
          </Text>
        )}
      </View>


    </ScrollView>
  );
};

export default PymeDashboard;