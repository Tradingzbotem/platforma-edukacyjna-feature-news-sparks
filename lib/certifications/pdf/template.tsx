/**
 * Szablon PDF (@react-pdf/renderer) — Noto Sans (PL + EN), 1× A4 landscape.
 */
import 'server-only';

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { CertificatePdfBilingualCopy } from '@/lib/certifications/pdf/bilingualCopy';
import type { CertificationViewModel } from '@/lib/certifications/types';
import type { SkillBreakdownRow } from '@/lib/certifications/pdf/skillBreakdown';

const FF = 'NotoSans';

const palette = {
  pageBg: '#05070b',
  innerBg: '#080b11',
  ink: '#f2efe6',
  inkSoft: '#b8b3a8',
  inkFaint: '#7a756c',
  gold: '#c9a962',
  goldBright: '#e4cf7a',
  goldLine: '#8a7340',
  hairline: '#1e2430',
  cellBg: '#0c1018',
};

const styles = StyleSheet.create({
  /**
   * Bez zagnieżdżonego flexGrow + minHeight na całej stronie — taki układ potrafi
   * zawiesić layout Yoga w @react-pdf (strumień PDF nigdy nie kończy się → timeout klienta).
   */
  page: {
    fontFamily: FF,
    fontWeight: 400,
    backgroundColor: palette.pageBg,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    color: palette.ink,
  },
  outerFrame: {
    borderWidth: 0.75,
    borderColor: palette.goldLine,
    padding: 2,
  },
  innerFrame: {
    borderWidth: 0.5,
    borderColor: palette.hairline,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 8,
    backgroundColor: palette.innerBg,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  brandMark: {
    fontSize: 8,
    letterSpacing: 2.8,
    color: palette.goldBright,
    textTransform: 'uppercase',
    fontFamily: FF,
    fontWeight: 700,
  },
  brandSubtleEn: {
    fontSize: 7,
    color: palette.inkSoft,
    marginTop: 2,
    letterSpacing: 1,
    fontFamily: FF,
    fontWeight: 400,
  },
  brandSubtlePl: {
    fontSize: 6,
    color: palette.inkFaint,
    marginTop: 1,
    fontFamily: FF,
    fontWeight: 400,
  },
  trackBadge: {
    borderWidth: 0.5,
    borderColor: palette.goldLine,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: palette.cellBg,
    alignItems: 'flex-end',
  },
  trackBadgeEn: {
    fontSize: 6.5,
    color: palette.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: FF,
    fontWeight: 700,
    textAlign: 'right',
    maxWidth: 200,
  },
  trackBadgePl: {
    fontSize: 5.5,
    color: palette.inkFaint,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: FF,
    fontWeight: 400,
    textAlign: 'right',
    marginTop: 2,
    maxWidth: 200,
  },

  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ornamentLine: {
    flex: 1,
    height: 0.75,
    backgroundColor: palette.goldLine,
  },
  ornamentDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: palette.gold,
    marginHorizontal: 10,
  },

  ceremonialBlock: {
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  prestigeEn: {
    fontSize: 7.5,
    letterSpacing: 2.5,
    color: palette.goldLine,
    textTransform: 'uppercase',
    fontFamily: FF,
    fontWeight: 700,
    marginBottom: 2,
    textAlign: 'center',
  },
  prestigePl: {
    fontSize: 6,
    color: palette.inkFaint,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: FF,
    fontWeight: 400,
    marginBottom: 3,
    textAlign: 'center',
  },
  mainTitleEn: {
    fontSize: 13,
    fontFamily: FF,
    fontWeight: 700,
    color: palette.goldBright,
    textAlign: 'center',
    marginBottom: 2,
  },
  mainTitlePl: {
    fontSize: 8,
    fontFamily: FF,
    fontWeight: 400,
    color: palette.inkSoft,
    textAlign: 'center',
    marginBottom: 3,
  },
  certifiesEn: {
    fontSize: 8.5,
    fontFamily: FF,
    fontWeight: 400,
    fontStyle: 'italic',
    color: palette.inkSoft,
    textAlign: 'center',
    marginBottom: 2,
  },
  certifiesPl: {
    fontSize: 7,
    fontFamily: FF,
    fontWeight: 400,
    fontStyle: 'italic',
    color: palette.inkFaint,
    textAlign: 'center',
    marginBottom: 3,
  },
  recipientName: {
    fontSize: 19,
    fontFamily: FF,
    fontWeight: 700,
    color: palette.ink,
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 1.12,
    maxWidth: '100%',
  },
  completionEn: {
    fontSize: 8.5,
    fontFamily: FF,
    fontWeight: 400,
    color: palette.inkSoft,
    textAlign: 'center',
    lineHeight: 1.28,
    maxWidth: 520,
    marginBottom: 2,
  },
  completionPl: {
    fontSize: 6.5,
    fontFamily: FF,
    fontWeight: 400,
    color: palette.inkFaint,
    textAlign: 'center',
    lineHeight: 1.28,
    maxWidth: 520,
    marginBottom: 2,
  },
  completionTrackEn: {
    fontSize: 10,
    fontFamily: FF,
    fontWeight: 700,
    color: palette.gold,
    textAlign: 'center',
    marginBottom: 1,
  },
  completionTrackPl: {
    fontSize: 7.5,
    fontFamily: FF,
    fontWeight: 400,
    color: palette.goldBright,
    textAlign: 'center',
    marginBottom: 3,
  },

  metaOrnament: {
    width: 36,
    height: 1,
    backgroundColor: palette.goldLine,
    alignSelf: 'center',
    marginBottom: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  metaCell: {
    width: '48%',
    marginBottom: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: palette.cellBg,
    borderTopWidth: 0.75,
    borderTopColor: palette.goldLine,
    alignItems: 'center',
  },
  metaLabelEn: {
    fontSize: 6,
    color: palette.inkFaint,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: FF,
    fontWeight: 700,
    marginBottom: 1,
    textAlign: 'center',
  },
  metaLabelPl: {
    fontSize: 5.5,
    color: palette.inkFaint,
    letterSpacing: 0.5,
    fontFamily: FF,
    fontWeight: 400,
    marginBottom: 2,
    textAlign: 'center',
  },
  metaValue: {
    fontSize: 10.5,
    color: palette.ink,
    fontFamily: FF,
    fontWeight: 700,
    textAlign: 'center',
  },
  metaValueMono: {
    fontSize: 7,
    fontFamily: FF,
    fontWeight: 400,
    color: palette.goldBright,
    textAlign: 'center',
  },

  sectionSpacer: {
    marginTop: 3,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: palette.hairline,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#5c4d32',
  },
  sectionTitleCol: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  sectionTitleEn: {
    fontSize: 6.5,
    color: palette.gold,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontFamily: FF,
    fontWeight: 700,
    textAlign: 'center',
  },
  sectionTitlePl: {
    fontSize: 5.5,
    color: palette.inkFaint,
    letterSpacing: 0.5,
    fontFamily: FF,
    fontWeight: 400,
    textAlign: 'center',
    marginTop: 1,
  },
  skillTable: {
    borderWidth: 0.5,
    borderColor: palette.hairline,
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.hairline,
  },
  skillRowLast: {
    borderBottomWidth: 0,
  },
  skillLabel: {
    fontSize: 8,
    color: palette.ink,
    fontFamily: FF,
    fontWeight: 400,
    maxWidth: '70%',
  },
  skillPct: {
    fontSize: 9,
    color: palette.goldBright,
    fontFamily: FF,
    fontWeight: 700,
  },
  skillFallback: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: palette.cellBg,
    borderLeftWidth: 1,
    borderLeftColor: palette.goldLine,
  },
  skillFallbackEn: {
    fontSize: 7.5,
    fontFamily: FF,
    fontWeight: 400,
    fontStyle: 'italic',
    color: palette.inkSoft,
    lineHeight: 1.32,
    textAlign: 'center',
    marginBottom: 3,
  },
  skillFallbackPl: {
    fontSize: 7,
    fontFamily: FF,
    fontWeight: 400,
    fontStyle: 'italic',
    color: palette.inkFaint,
    lineHeight: 1.32,
    textAlign: 'center',
  },

  verifySection: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: palette.goldLine,
    width: '100%',
  },
  verifyTitleBlock: {
    alignItems: 'center',
    marginBottom: 4,
  },
  verifyTitleEn: {
    fontSize: 7,
    color: palette.gold,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: FF,
    fontWeight: 700,
    marginBottom: 2,
    textAlign: 'center',
  },
  verifyTitlePl: {
    fontSize: 6,
    color: palette.inkFaint,
    letterSpacing: 0.5,
    fontFamily: FF,
    fontWeight: 400,
    textAlign: 'center',
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  verifyTextCol: {
    flex: 1,
    maxWidth: '58%',
    paddingRight: 10,
    alignItems: 'flex-start',
  },
  verifyScanEn: {
    fontSize: 7,
    color: palette.inkSoft,
    fontFamily: FF,
    fontWeight: 400,
    textAlign: 'left',
    lineHeight: 1.35,
    marginBottom: 3,
  },
  verifyScanPl: {
    fontSize: 6.5,
    color: palette.inkFaint,
    fontFamily: FF,
    fontWeight: 400,
    textAlign: 'left',
    lineHeight: 1.35,
  },
  verifyQrFrame: {
    padding: 5,
    borderWidth: 0.75,
    borderColor: palette.goldLine,
    backgroundColor: '#ffffff',
  },
  qr: {
    width: 76,
    height: 76,
    objectFit: 'contain',
  },
  verifyNoQr: {
    fontSize: 7,
    color: palette.inkFaint,
    fontFamily: FF,
    fontWeight: 400,
    textAlign: 'center',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: 4,
  },

  footNoteEn: {
    marginTop: 5,
    fontSize: 5.5,
    color: palette.inkFaint,
    textAlign: 'center',
    lineHeight: 1.3,
    fontFamily: FF,
    fontWeight: 400,
  },
  footNotePl: {
    marginTop: 2,
    fontSize: 5.5,
    color: palette.inkFaint,
    textAlign: 'center',
    lineHeight: 1.3,
    fontFamily: FF,
    fontWeight: 400,
  },
});

export type CertificatePdfDocumentProps = {
  certificate: CertificationViewModel;
  copy: CertificatePdfBilingualCopy;
  track: { enBadge: string; plBadge: string; enLine: string; plLine: string };
  qrImageBuffer: Buffer | null;
  issuedDateDisplay: string;
  skillRows: SkillBreakdownRow[] | null;
};

export function CertificatePdfDocument({
  certificate,
  copy,
  track,
  qrImageBuffer,
  issuedDateDisplay,
  skillRows,
}: CertificatePdfDocumentProps) {
  const hasQr = qrImageBuffer != null && qrImageBuffer.length > 0;

  return (
    <Document title={`FXEDULAB Certificate ${certificate.certificateId}`} author="FXEDULAB">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.brandMark}>FXEDULAB</Text>
                  <Text style={styles.brandSubtleEn}>{copy.brandSubtle.en}</Text>
                  <Text style={styles.brandSubtlePl}>{copy.brandSubtle.pl}</Text>
                </View>
                <View style={styles.trackBadge}>
                  <Text style={styles.trackBadgeEn}>{track.enBadge}</Text>
                  <Text style={styles.trackBadgePl}>{track.plBadge}</Text>
                </View>
              </View>

              <View style={styles.ornamentRow}>
                <View style={styles.ornamentLine} />
                <View style={styles.ornamentDot} />
                <View style={styles.ornamentLine} />
              </View>

              <View style={styles.ceremonialBlock}>
                <Text style={styles.prestigeEn}>{copy.prestigeBrand.en}</Text>
                <Text style={styles.prestigePl}>{copy.prestigeBrand.pl}</Text>
                <Text style={styles.mainTitleEn}>{copy.mainTitle.en}</Text>
                <Text style={styles.mainTitlePl}>{copy.mainTitle.pl}</Text>
                <Text style={styles.certifiesEn}>{copy.certifiesIntro.en}</Text>
                <Text style={styles.certifiesPl}>{copy.certifiesIntro.pl}</Text>
                <Text style={styles.recipientName}>{certificate.fullName}</Text>
                <Text style={styles.completionEn}>{copy.completionLine.en}</Text>
                <Text style={styles.completionPl}>{copy.completionLine.pl}</Text>
                <Text style={styles.completionTrackEn}>{track.enLine}</Text>
                <Text style={styles.completionTrackPl}>{track.plLine}</Text>
              </View>

              <View style={styles.metaOrnament} />

              <View style={styles.metaGrid}>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabelEn}>{copy.metaScore.en}</Text>
                  <Text style={styles.metaLabelPl}>{copy.metaScore.pl}</Text>
                  <Text style={styles.metaValue}>{certificate.scorePercent}%</Text>
                </View>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabelEn}>{copy.metaLevel.en}</Text>
                  <Text style={styles.metaLabelPl}>{copy.metaLevel.pl}</Text>
                  <Text style={styles.metaValue}>{certificate.level}</Text>
                </View>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabelEn}>{copy.metaDateIssued.en}</Text>
                  <Text style={styles.metaLabelPl}>{copy.metaDateIssued.pl}</Text>
                  <Text style={styles.metaValue}>{issuedDateDisplay}</Text>
                </View>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabelEn}>{copy.metaCertificateId.en}</Text>
                  <Text style={styles.metaLabelPl}>{copy.metaCertificateId.pl}</Text>
                  <Text style={styles.metaValueMono}>{certificate.certificateId}</Text>
                </View>
              </View>

              <View style={styles.sectionSpacer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLine} />
                  <View style={styles.sectionTitleCol}>
                    <Text style={styles.sectionTitleEn}>{copy.competencyProfile.en}</Text>
                    <Text style={styles.sectionTitlePl}>{copy.competencyProfile.pl}</Text>
                  </View>
                  <View style={styles.sectionHeaderLine} />
                </View>

                {skillRows && skillRows.length > 0 ? (
                  <View style={styles.skillTable}>
                    {skillRows.map((row, i) => (
                      <View
                        key={`${row.label}-${row.percent}-${i}`}
                        style={i === skillRows.length - 1 ? [styles.skillRow, styles.skillRowLast] : styles.skillRow}
                      >
                        <Text style={styles.skillLabel}>{row.label}</Text>
                        <Text style={styles.skillPct}>{row.percent}%</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.skillFallback}>
                    <Text style={styles.skillFallbackEn}>{copy.skillFallback.en}</Text>
                    <Text style={styles.skillFallbackPl}>{copy.skillFallback.pl}</Text>
                  </View>
                )}
              </View>

              <View style={styles.verifySection}>
                <View style={styles.verifyTitleBlock}>
                  <Text style={styles.verifyTitleEn}>{copy.authSectionTitle.en}</Text>
                  <Text style={styles.verifyTitlePl}>{copy.authSectionTitle.pl}</Text>
                </View>
                {hasQr ? (
                  <View style={styles.verifyRow}>
                    <View style={styles.verifyTextCol}>
                      <Text style={styles.verifyScanEn}>{copy.verifyScan.en}</Text>
                      <Text style={styles.verifyScanPl}>{copy.verifyScan.pl}</Text>
                    </View>
                    <View style={styles.verifyQrFrame}>
                      <Image src={qrImageBuffer!} style={styles.qr} />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.verifyNoQr}>
                    {copy.verifyScan.en}
                    {'\n'}
                    {copy.verifyScan.pl}
                  </Text>
                )}
              </View>

              <Text style={styles.footNoteEn}>{copy.footNote.en}</Text>
              <Text style={styles.footNotePl}>{copy.footNote.pl}</Text>
            </View>
        </View>
      </Page>
    </Document>
  );
}
