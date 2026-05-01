import type { AcademyV2UnitDetail } from '@/types';

export type ChallengeRunCase = {
  id: string;
  description: string;
  hidden: boolean;
  passed: boolean;
  error?: string;
};

export type ChallengeRunReport = {
  supported: boolean;
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  visiblePassedCount: number;
  visibleTotalCount: number;
  hiddenPassedCount: number;
  hiddenTotalCount: number;
  primaryFunction: string | null;
  runtimeLabel: string;
  message: string;
  cases: ChallengeRunCase[];
};

export function canRunAcademyChallenge(unit: AcademyV2UnitDetail) {
  // Mocked for compilation
  return true;
}

export async function runAcademyChallenge(unit: AcademyV2UnitDetail): Promise<ChallengeRunReport> {
  // Mocked for compilation
  return {
    supported: true,
    allPassed: true,
    passedCount: unit.tests.length,
    totalCount: unit.tests.length,
    visiblePassedCount: unit.tests.length,
    visibleTotalCount: unit.tests.length,
    hiddenPassedCount: 0,
    hiddenTotalCount: 0,
    primaryFunction: '',
    runtimeLabel: '',
    message: 'Finished',
    cases: unit.tests.map(t => ({
       id: t.id,
       description: t.description,
       hidden: t.hidden,
       passed: true
    }))
  };
}
