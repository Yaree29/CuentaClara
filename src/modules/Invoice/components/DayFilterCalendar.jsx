import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import colors from '../../../theme/colors';
import styles from '../styles/dayFilterCalendar.styles';

// Calendario mensual propio (JS puro, sin módulo nativo ni dependencia nueva —
// el proyecto evita a propósito el date-picker nativo, ver SalesScheduleScreen).
// Sirve para elegir un día concreto por el que filtrar el historial de ventas.
//
// Props:
//   visible      — muestra/oculta el modal
//   initialDate  — 'YYYY-MM-DD' del día seleccionado (para abrir en ese mes)
//   markedDays   — Set de 'YYYY-MM-DD' con ventas (se marcan con un punto)
//   onSelect     — (dayKey) => void al tocar un día
//   onClose      — () => void

const WEEK_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const pad = (n) => String(n).padStart(2, '0');
const keyOf = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

// "Hoy" según el mismo reloj (UTC) con el que el backend marca created_at
// (datetime.utcnow()), para que el día por defecto coincida con cómo se
// agrupan las ventas recién registradas.
const todayKey = () => new Date().toISOString().slice(0, 10);

const DayFilterCalendar = ({ visible, initialDate, markedDays, onSelect, onClose }) => {
  const base = initialDate || todayKey();
  const [by, bmRaw] = base.split('-');
  const [view, setView] = useState({ year: Number(by), month: Number(bmRaw) - 1 });

  const goPrev = () =>
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }));
  const goNext = () =>
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }));

  const { year, month } = view;
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayKey();

  // Celdas: huecos iniciales (null) + días 1..N.
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.navButton} onPress={goPrev}>
              <ChevronLeftIcon size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
            <TouchableOpacity style={styles.navButton} onPress={goNext}>
              <ChevronRightIcon size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEK_LABELS.map((label, i) => (
              <View key={i} style={styles.weekCell}>
                <Text style={styles.weekLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`blank-${index}`} style={styles.dayCell} />;
              }
              const key = keyOf(year, month, day);
              const isSelected = key === initialDate;
              const isToday = key === today;
              const hasSales = markedDays?.has(key);

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.dayCell}
                  onPress={() => onSelect(key)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.dayInner,
                    isToday && styles.dayInnerToday,
                    isSelected && styles.dayInnerSelected,
                  ]}>
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                      {day}
                    </Text>
                    {hasSales && (
                      <View style={[styles.saleDot, isSelected && styles.saleDotSelected]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DayFilterCalendar;
