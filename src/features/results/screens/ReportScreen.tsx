import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Bank, CheckSquare, Drop, FilePdf, UsersThree } from 'phosphor-react-native';
import { useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';

import type { ProjectResults } from '@/data/hooks/useProjectResults';
import { useProjectStore } from '@/data/store/ProjectProvider';
import AppText from '@/shared/components/AppText';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import MonthChart from '@/shared/components/charts/MonthChart';
import { colors, fonts, radii, shadows } from '@/shared/global.styles';

import ResultDetail from '../components/ResultDetail';
import { buildReportHtml } from '../report/buildReportHtml';
import { useResultFormat } from '../useResultFormat';

const SECTIONS = [
  'inputs',
  'balance',
  'tank',
  'money',
  'quality',
  'resilience',
  'recommendation',
] as const;

export default function ReportScreen() {
  const { s } = useResultFormat();

  return (
    <ResultDetail title={s.report.title}>
      {(results) => <ReportContent results={results} />}
    </ResultDetail>
  );
}

function ReportContent({ results }: { results: ProjectResults }) {
  const { s, fill, number, percent, m3, date } = useResultFormat();
  const { project, preferences } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const generatedOn = date(today, { day: 'numeric', month: 'short', year: 'numeric' });
  const address = project.building?.address ?? '';
  const { typical } = results.simulation;
  const verdictText = results.verdict.feasible
    ? s.results.verdict[results.verdict.bestOption]
    : s.results.verdict.weak;

  const exportPdf = async () => {
    setIsExporting(true);
    try {
      const html = buildReportHtml(project, preferences, results, generatedOn);
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const shareSummary = () =>
    void Share.share({
      message: `${fill(s.report.shareMessage, { address })}\n${verdictText}\n${s.report.collected}: ${m3(typical.inflowM3)} · ${s.report.covered}: ${percent(typical.coverage)}`,
    });

  return (
    <>
      <View style={styles.page}>
        <View style={styles.row}>
          <Drop size={16} weight="fill" color={colors.teal} />
          <AppText style={styles.brand}>{s.report.header}</AppText>
          <View style={styles.flex} />
          <AppText variant="caption">{generatedOn}</AppText>
        </View>
        <AppText variant="subtitle" style={styles.pageTitle}>
          {fill(s.report.for, { address })}
        </AppText>
        <View style={styles.pageVerdict}>
          <AppText variant="caption" color={colors.primaryText}>
            {verdictText}
          </AppText>
        </View>
        <View style={styles.row}>
          {[
            { label: s.report.collected, value: m3(typical.inflowM3) },
            { label: s.report.covered, value: percent(typical.coverage) },
            {
              label: s.report.tank,
              value: fill(s.common.litres, { value: number(project.tankLitres) }),
            },
          ].map((tile) => (
            <View key={tile.label} style={styles.pageTile}>
              <AppText variant="caption">{tile.label}</AppText>
              <AppText style={styles.pageTileValue}>{tile.value}</AppText>
            </View>
          ))}
        </View>
        <MonthChart
          months={typical.months}
          monthInitials={s.common.monthInitials.split('')}
          unitLabel={s.month.chartUnit}
          height={120}
        />
      </View>

      <Card compact>
        <AppText variant="label" style={styles.includesLabel}>
          {s.report.includes}
        </AppText>
        {SECTIONS.map((section) => (
          <View key={section} style={styles.includeRow}>
            <CheckSquare size={18} weight="fill" color={colors.teal} />
            <AppText color={colors.primaryText}>{s.report.sections[section]}</AppText>
          </View>
        ))}
      </Card>

      <Button
        label={s.report.download}
        icon={FilePdf}
        isLoading={isExporting}
        onPress={() => void exportPdf()}
      />
      <View style={styles.row}>
        <Button
          label={s.report.neighbours}
          icon={UsersThree}
          variant="secondary"
          compact
          style={styles.flex}
          onPress={shareSummary}
        />
        <Button
          label={s.report.townHall}
          icon={Bank}
          variant="secondary"
          compact
          style={styles.flex}
          onPress={() => void exportPdf()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 10,
    padding: 18,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.buttonText,
    ...shadows.floating,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  brand: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.buttons,
  },
  pageTitle: {
    fontSize: 17,
  },
  pageVerdict: {
    padding: 9,
    borderRadius: 10,
    backgroundColor: colors.warningBackground,
  },
  pageTile: {
    flex: 1,
    padding: 7,
    borderRadius: 8,
    backgroundColor: colors.inactiveTab,
  },
  pageTileValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primaryText,
  },
  includesLabel: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
});
