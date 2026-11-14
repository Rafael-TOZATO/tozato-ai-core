export const metricsData = {
  development: {
    contributions: {
      value: 883,
      label: "Contribuições",
      period: "Últimos 12 meses",
      source: "GitHub",
    },
    repositories: {
      value: 41,
      label: "Repositórios",
      source: "GitHub",
    },
  },

  githubReach: {
    clones: {
      value: 1050,
      label: "Clones",
      period: "Últimos 14 dias",
    },
    uniqueCloners: {
      value: 350,
      label: "Clonadores únicos",
      period: "Últimos 14 dias",
    },
  },

  activityDistribution: {
    pullRequests: 96,
    issues: 3,
    codeReviews: 1,
    unit: "%",
    source: "Distribuição de atividades do perfil GitHub",
  },

  projects: [
    {
      name: "Tozato AI-Core",
      url: "https://github.com/Rafael-TOZATO/tozato-ai-core",
    },
    {
      name: "H-Folio",
      url: "https://github.com/Rafael-TOZATO/h-folio",
    },
  ],

  unavailable: {
    securityVulnerabilities: null,
    workflowExecutions: null,
    successfulBuilds: null,
    successfulDeployments: null,
    testCoverage: null,
    powerBiDashboards: null,
  },
};
