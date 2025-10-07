/**
 * Comprehensive connector registry for Conversa SDK
 * This file defines all 100+ supported data connectors
 */

export const CONNECTOR_REGISTRY = {
  // E-commerce Platforms (15 connectors)
  ecommerce: {
    shopify: {
      name: 'Shopify',
      description: 'E-commerce platform for online stores',
      dataTypes: ['products', 'orders', 'customers', 'inventory', 'analytics'],
      capabilities: ['real-time', 'webhooks', 'bulk-export'],
    },
    woocommerce: {
      name: 'WooCommerce',
      description: 'WordPress e-commerce plugin',
      dataTypes: ['products', 'orders', 'customers', 'revenue', 'categories'],
      capabilities: ['wordpress-integration', 'extensions'],
    },
    bigcommerce: {
      name: 'BigCommerce',
      description: 'Enterprise e-commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'analytics', 'categories', 'brands'],
      capabilities: ['multi-channel', 'headless-commerce'],
    },
    magento: {
      name: 'Magento',
      description: 'Open-source e-commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'catalog', 'inventory'],
      capabilities: ['enterprise-features', 'customization'],
    },
    squarespace: {
      name: 'Squarespace',
      description: 'Website builder with e-commerce',
      dataTypes: ['products', 'orders', 'customers', 'analytics'],
      capabilities: ['website-integration', 'design-tools'],
    },
    wix: {
      name: 'Wix',
      description: 'Website builder with e-commerce',
      dataTypes: ['products', 'orders', 'customers', 'analytics'],
      capabilities: ['drag-drop-builder', 'apps-marketplace'],
    },
    prestashop: {
      name: 'PrestaShop',
      description: 'Open-source e-commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'modules'],
      capabilities: ['multilingual', 'multi-store'],
    },
    opencart: {
      name: 'OpenCart',
      description: 'Open-source e-commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'extensions'],
      capabilities: ['extensions', 'themes'],
    },
    volusion: {
      name: 'Volusion',
      description: 'E-commerce platform for small businesses',
      dataTypes: ['products', 'orders', 'customers', 'analytics'],
      capabilities: ['built-in-tools', 'hosting'],
    },
    ecwid: {
      name: 'Ecwid',
      description: 'E-commerce widget for websites',
      dataTypes: ['products', 'orders', 'customers', 'analytics'],
      capabilities: ['widget-based', 'multi-platform'],
    },
    shopware: {
      name: 'Shopware',
      description: 'German e-commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'plugins'],
      capabilities: ['b2b-features', 'marketplace'],
    },
    commercetools: {
      name: 'Commercetools',
      description: 'Headless commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'catalog'],
      capabilities: ['headless', 'microservices'],
    },
    elasticpath: {
      name: 'Elastic Path',
      description: 'Headless commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'catalog'],
      capabilities: ['headless', 'composable-commerce'],
    },
    spree: {
      name: 'Spree Commerce',
      description: 'Open-source e-commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'extensions'],
      capabilities: ['ruby-based', 'api-first'],
    },
    sylius: {
      name: 'Sylius',
      description: 'Open-source e-commerce platform',
      dataTypes: ['products', 'orders', 'customers', 'plugins'],
      capabilities: ['symfony-based', 'api-first'],
    },
  },

  // Payment Processors (12 connectors)
  payments: {
    stripe: {
      name: 'Stripe',
      description: 'Online payment processing',
      dataTypes: ['payments', 'subscriptions', 'customers', 'invoices', 'charges'],
      capabilities: ['real-time', 'webhooks', 'global'],
    },
    paypal: {
      name: 'PayPal',
      description: 'Digital payment platform',
      dataTypes: ['transactions', 'subscriptions', 'payouts', 'disputes'],
      capabilities: ['global', 'marketplace'],
    },
    square: {
      name: 'Square',
      description: 'Point-of-sale and payment processing',
      dataTypes: ['payments', 'orders', 'inventory', 'customers', 'locations'],
      capabilities: ['pos-integration', 'offline-payments'],
    },
    braintree: {
      name: 'Braintree',
      description: 'Payment platform by PayPal',
      dataTypes: ['transactions', 'customers', 'subscriptions', 'merchant-accounts'],
      capabilities: ['paypal-integration', 'marketplace'],
    },
    razorpay: {
      name: 'Razorpay',
      description: 'Indian payment gateway',
      dataTypes: ['payments', 'orders', 'customers', 'subscriptions'],
      capabilities: ['india-focused', 'upi-integration'],
    },
    adyen: {
      name: 'Adyen',
      description: 'Global payment platform',
      dataTypes: ['payments', 'customers', 'accounts', 'transfers'],
      capabilities: ['global', 'enterprise'],
    },
    worldpay: {
      name: 'Worldpay',
      description: 'Payment processing services',
      dataTypes: ['payments', 'customers', 'accounts'],
      capabilities: ['global', 'enterprise'],
    },
    authorize: {
      name: 'Authorize.Net',
      description: 'Payment gateway services',
      dataTypes: ['transactions', 'customers', 'subscriptions'],
      capabilities: ['us-focused', 'merchant-services'],
    },
    mollie: {
      name: 'Mollie',
      description: 'European payment service provider',
      dataTypes: ['payments', 'customers', 'subscriptions', 'refunds'],
      capabilities: ['europe-focused', 'local-payments'],
    },
    klarna: {
      name: 'Klarna',
      description: 'Buy now, pay later service',
      dataTypes: ['orders', 'customers', 'payments', 'refunds'],
      capabilities: ['bnpl', 'europe-us'],
    },
    afterpay: {
      name: 'Afterpay',
      description: 'Buy now, pay later service',
      dataTypes: ['orders', 'customers', 'payments', 'refunds'],
      capabilities: ['bnpl', 'global'],
    },
    sezzle: {
      name: 'Sezzle',
      description: 'Buy now, pay later service',
      dataTypes: ['orders', 'customers', 'payments', 'refunds'],
      capabilities: ['bnpl', 'us-canada'],
    },
  },

  // CRM Platforms (10 connectors)
  crm: {
    salesforce: {
      name: 'Salesforce',
      description: 'Customer relationship management platform',
      dataTypes: ['leads', 'opportunities', 'accounts', 'contacts', 'campaigns'],
      capabilities: ['enterprise', 'customization', 'automation'],
    },
    hubspot: {
      name: 'HubSpot',
      description: 'Inbound marketing and sales platform',
      dataTypes: ['contacts', 'companies', 'deals', 'tickets', 'campaigns'],
      capabilities: ['marketing-automation', 'free-tier'],
    },
    pipedrive: {
      name: 'Pipedrive',
      description: 'Sales-focused CRM',
      dataTypes: ['deals', 'contacts', 'organizations', 'activities'],
      capabilities: ['sales-focused', 'visual-pipeline'],
    },
    zoho: {
      name: 'Zoho CRM',
      description: 'Cloud-based CRM suite',
      dataTypes: ['leads', 'contacts', 'deals', 'accounts', 'campaigns'],
      capabilities: ['integrated-suite', 'customization'],
    },
    monday: {
      name: 'Monday.com',
      description: 'Work operating system',
      dataTypes: ['boards', 'items', 'users', 'teams', 'projects'],
      capabilities: ['project-management', 'automation'],
    },
    freshworks: {
      name: 'Freshworks',
      description: 'Customer engagement suite',
      dataTypes: ['contacts', 'deals', 'tickets', 'campaigns'],
      capabilities: ['multi-product', 'ai-powered'],
    },
    insightly: {
      name: 'Insightly',
      description: 'CRM and project management',
      dataTypes: ['leads', 'contacts', 'opportunities', 'projects'],
      capabilities: ['project-integration', 'small-business'],
    },
    agilecrm: {
      name: 'Agile CRM',
      description: 'All-in-one CRM platform',
      dataTypes: ['contacts', 'deals', 'campaigns', 'tasks'],
      capabilities: ['all-in-one', 'marketing-automation'],
    },
    nimble: {
      name: 'Nimble',
      description: 'Social CRM platform',
      dataTypes: ['contacts', 'companies', 'deals', 'activities'],
      capabilities: ['social-integration', 'contact-enrichment'],
    },
    copper: {
      name: 'Copper',
      description: 'CRM built for Google Workspace',
      dataTypes: ['people', 'companies', 'opportunities', 'projects'],
      capabilities: ['google-integration', 'gmail-native'],
    },
  },

  // Analytics Platforms (8 connectors)
  analytics: {
    'google-analytics': {
      name: 'Google Analytics',
      description: 'Web analytics service',
      dataTypes: ['traffic', 'conversions', 'audience', 'content', 'acquisition'],
      capabilities: ['real-time', 'attribution', 'machine-learning'],
    },
    mixpanel: {
      name: 'Mixpanel',
      description: 'Product analytics platform',
      dataTypes: ['events', 'funnels', 'cohorts', 'retention'],
      capabilities: ['event-tracking', 'product-analytics'],
    },
    amplitude: {
      name: 'Amplitude',
      description: 'Digital analytics platform',
      dataTypes: ['events', 'users', 'cohorts', 'experiments'],
      capabilities: ['behavioral-analytics', 'experimentation'],
    },
    'adobe-analytics': {
      name: 'Adobe Analytics',
      description: 'Enterprise analytics platform',
      dataTypes: ['visits', 'conversions', 'segments', 'reports'],
      capabilities: ['enterprise', 'attribution', 'segmentation'],
    },
    heap: {
      name: 'Heap',
      description: 'Automatic event tracking',
      dataTypes: ['events', 'users', 'sessions', 'funnels'],
      capabilities: ['automatic-tracking', 'retroactive-analysis'],
    },
    hotjar: {
      name: 'Hotjar',
      description: 'User behavior analytics',
      dataTypes: ['heatmaps', 'recordings', 'surveys', 'feedback'],
      capabilities: ['visual-analytics', 'user-feedback'],
    },
    fullstory: {
      name: 'FullStory',
      description: 'Digital experience analytics',
      dataTypes: ['sessions', 'events', 'errors', 'performance'],
      capabilities: ['session-replay', 'error-tracking'],
    },
    segment: {
      name: 'Segment',
      description: 'Customer data platform',
      dataTypes: ['events', 'users', 'identifies', 'tracks'],
      capabilities: ['data-pipeline', 'real-time'],
    },
  },

  // Marketing Platforms (12 connectors)
  marketing: {
    mailchimp: {
      name: 'Mailchimp',
      description: 'Email marketing platform',
      dataTypes: ['campaigns', 'audiences', 'automations', 'reports'],
      capabilities: ['email-marketing', 'automation', 'e-commerce'],
    },
    klaviyo: {
      name: 'Klaviyo',
      description: 'Email and SMS marketing platform',
      dataTypes: ['profiles', 'campaigns', 'flows', 'metrics'],
      capabilities: ['e-commerce-focused', 'sms-marketing'],
    },
    sendgrid: {
      name: 'SendGrid',
      description: 'Email delivery platform',
      dataTypes: ['emails', 'suppressions', 'stats', 'templates'],
      capabilities: ['email-delivery', 'api-first'],
    },
    'constant-contact': {
      name: 'Constant Contact',
      description: 'Email marketing platform',
      dataTypes: ['campaigns', 'contacts', 'events', 'reports'],
      capabilities: ['small-business', 'event-marketing'],
    },
    campaignmonitor: {
      name: 'Campaign Monitor',
      description: 'Email marketing platform',
      dataTypes: ['campaigns', 'subscribers', 'lists', 'templates'],
      capabilities: ['design-focused', 'automation'],
    },
    aweber: {
      name: 'AWeber',
      description: 'Email marketing platform',
      dataTypes: ['campaigns', 'subscribers', 'automations', 'reports'],
      capabilities: ['small-business', 'automation'],
    },
    getresponse: {
      name: 'GetResponse',
      description: 'Email marketing platform',
      dataTypes: ['campaigns', 'contacts', 'automations', 'webinars'],
      capabilities: ['webinar-integration', 'automation'],
    },
    activecampaign: {
      name: 'ActiveCampaign',
      description: 'Marketing automation platform',
      dataTypes: ['contacts', 'campaigns', 'automations', 'deals'],
      capabilities: ['marketing-automation', 'crm-integration'],
    },
    pardot: {
      name: 'Pardot',
      description: 'B2B marketing automation',
      dataTypes: ['prospects', 'campaigns', 'forms', 'reports'],
      capabilities: ['b2b-focused', 'salesforce-integration'],
    },
    marketo: {
      name: 'Marketo',
      description: 'Marketing automation platform',
      dataTypes: ['leads', 'campaigns', 'programs', 'reports'],
      capabilities: ['enterprise', 'account-based-marketing'],
    },
    hubspot_marketing: {
      name: 'HubSpot Marketing',
      description: 'Marketing automation platform',
      dataTypes: ['contacts', 'campaigns', 'forms', 'reports'],
      capabilities: ['inbound-marketing', 'crm-integration'],
    },
    intercom: {
      name: 'Intercom',
      description: 'Customer messaging platform',
      dataTypes: ['conversations', 'users', 'articles', 'campaigns'],
      capabilities: ['live-chat', 'customer-support'],
    },
  },

  // Support Platforms (8 connectors)
  support: {
    zendesk: {
      name: 'Zendesk',
      description: 'Customer service platform',
      dataTypes: ['tickets', 'users', 'organizations', 'articles'],
      capabilities: ['multi-channel', 'knowledge-base'],
    },
    intercom: {
      name: 'Intercom',
      description: 'Customer messaging platform',
      dataTypes: ['conversations', 'users', 'articles', 'campaigns'],
      capabilities: ['live-chat', 'product-tours'],
    },
    freshdesk: {
      name: 'Freshdesk',
      description: 'Customer support software',
      dataTypes: ['tickets', 'contacts', 'agents', 'solutions'],
      capabilities: ['multi-channel', 'automation'],
    },
    'help-scout': {
      name: 'Help Scout',
      description: 'Customer service platform',
      dataTypes: ['conversations', 'customers', 'docs', 'reports'],
      capabilities: ['email-focused', 'knowledge-base'],
    },
    kayako: {
      name: 'Kayako',
      description: 'Customer service platform',
      dataTypes: ['tickets', 'customers', 'agents', 'knowledge-base'],
      capabilities: ['multi-channel', 'self-service'],
    },
    desk: {
      name: 'Desk.com',
      description: 'Customer service platform',
      dataTypes: ['cases', 'customers', 'agents', 'knowledge-base'],
      capabilities: ['salesforce-integration', 'multi-channel'],
    },
    uservoice: {
      name: 'UserVoice',
      description: 'Customer feedback platform',
      dataTypes: ['ideas', 'users', 'votes', 'comments'],
      capabilities: ['feedback-management', 'roadmap-planning'],
    },
    zoho_desk: {
      name: 'Zoho Desk',
      description: 'Customer service platform',
      dataTypes: ['tickets', 'contacts', 'agents', 'knowledge-base'],
      capabilities: ['ai-powered', 'multi-channel'],
    },
  },

  // Social Media Platforms (10 connectors)
  social: {
    'facebook-ads': {
      name: 'Facebook Ads',
      description: 'Facebook advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['social-advertising', 'audience-targeting'],
    },
    'linkedin-ads': {
      name: 'LinkedIn Ads',
      description: 'LinkedIn advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['b2b-advertising', 'professional-targeting'],
    },
    'twitter-ads': {
      name: 'Twitter Ads',
      description: 'Twitter advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['real-time-advertising', 'conversation-targeting'],
    },
    'instagram-ads': {
      name: 'Instagram Ads',
      description: 'Instagram advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['visual-advertising', 'story-ads'],
    },
    'tiktok-ads': {
      name: 'TikTok Ads',
      description: 'TikTok advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['video-advertising', 'gen-z-targeting'],
    },
    'snapchat-ads': {
      name: 'Snapchat Ads',
      description: 'Snapchat advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['ar-advertising', 'millennial-targeting'],
    },
    'pinterest-ads': {
      name: 'Pinterest Ads',
      description: 'Pinterest advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['visual-discovery', 'shopping-ads'],
    },
    'youtube-ads': {
      name: 'YouTube Ads',
      description: 'YouTube advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['video-advertising', 'google-integration'],
    },
    'reddit-ads': {
      name: 'Reddit Ads',
      description: 'Reddit advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['community-targeting', 'conversation-advertising'],
    },
    'quora-ads': {
      name: 'Quora Ads',
      description: 'Quora advertising platform',
      dataTypes: ['campaigns', 'ads', 'insights', 'audiences'],
      capabilities: ['intent-targeting', 'question-based-ads'],
    },
  },

  // Productivity Platforms (8 connectors)
  productivity: {
    slack: {
      name: 'Slack',
      description: 'Team communication platform',
      dataTypes: ['messages', 'channels', 'users', 'files'],
      capabilities: ['real-time-messaging', 'integrations'],
    },
    'microsoft-teams': {
      name: 'Microsoft Teams',
      description: 'Collaboration platform',
      dataTypes: ['messages', 'channels', 'users', 'meetings'],
      capabilities: ['office-integration', 'video-conferencing'],
    },
    asana: {
      name: 'Asana',
      description: 'Project management platform',
      dataTypes: ['projects', 'tasks', 'users', 'teams'],
      capabilities: ['project-management', 'workflow-automation'],
    },
    trello: {
      name: 'Trello',
      description: 'Visual project management',
      dataTypes: ['boards', 'cards', 'lists', 'members'],
      capabilities: ['kanban-boards', 'visual-management'],
    },
    notion: {
      name: 'Notion',
      description: 'All-in-one workspace',
      dataTypes: ['pages', 'databases', 'users', 'blocks'],
      capabilities: ['documentation', 'database-management'],
    },
    airtable: {
      name: 'Airtable',
      description: 'Database and collaboration platform',
      dataTypes: ['bases', 'tables', 'records', 'fields'],
      capabilities: ['database-management', 'collaboration'],
    },
    clickup: {
      name: 'ClickUp',
      description: 'Productivity platform',
      dataTypes: ['spaces', 'projects', 'tasks', 'users'],
      capabilities: ['all-in-one', 'customization'],
    },
    monday: {
      name: 'Monday.com',
      description: 'Work operating system',
      dataTypes: ['boards', 'items', 'users', 'teams'],
      capabilities: ['workflow-automation', 'visual-management'],
    },
  },

  // Cloud Storage Platforms (6 connectors)
  storage: {
    'google-drive': {
      name: 'Google Drive',
      description: 'Cloud storage and file sharing',
      dataTypes: ['files', 'folders', 'shares', 'permissions'],
      capabilities: ['collaboration', 'google-integration'],
    },
    dropbox: {
      name: 'Dropbox',
      description: 'Cloud storage platform',
      dataTypes: ['files', 'folders', 'shares', 'permissions'],
      capabilities: ['file-sync', 'collaboration'],
    },
    onedrive: {
      name: 'OneDrive',
      description: 'Microsoft cloud storage',
      dataTypes: ['files', 'folders', 'shares', 'permissions'],
      capabilities: ['office-integration', 'collaboration'],
    },
    box: {
      name: 'Box',
      description: 'Enterprise cloud storage',
      dataTypes: ['files', 'folders', 'collaborations', 'events'],
      capabilities: ['enterprise-security', 'compliance'],
    },
    aws_s3: {
      name: 'AWS S3',
      description: 'Amazon cloud storage',
      dataTypes: ['buckets', 'objects', 'metadata', 'permissions'],
      capabilities: ['scalable', 'api-first'],
    },
    azure_blob: {
      name: 'Azure Blob Storage',
      description: 'Microsoft cloud storage',
      dataTypes: ['containers', 'blobs', 'metadata', 'permissions'],
      capabilities: ['enterprise', 'azure-integration'],
    },
  },

  // Database Platforms (8 connectors)
  databases: {
    mysql: {
      name: 'MySQL',
      description: 'Open-source relational database',
      dataTypes: ['tables', 'records', 'queries', 'schemas'],
      capabilities: ['sql', 'relational', 'open-source'],
    },
    postgresql: {
      name: 'PostgreSQL',
      description: 'Advanced open-source database',
      dataTypes: ['tables', 'records', 'queries', 'schemas'],
      capabilities: ['sql', 'advanced-features', 'extensible'],
    },
    mongodb: {
      name: 'MongoDB',
      description: 'NoSQL document database',
      dataTypes: ['collections', 'documents', 'queries', 'indexes'],
      capabilities: ['nosql', 'document-based', 'scalable'],
    },
    redis: {
      name: 'Redis',
      description: 'In-memory data structure store',
      dataTypes: ['keys', 'values', 'hashes', 'lists'],
      capabilities: ['in-memory', 'caching', 'pub-sub'],
    },
    elasticsearch: {
      name: 'Elasticsearch',
      description: 'Search and analytics engine',
      dataTypes: ['indices', 'documents', 'queries', 'aggregations'],
      capabilities: ['search', 'analytics', 'real-time'],
    },
    cassandra: {
      name: 'Apache Cassandra',
      description: 'Distributed NoSQL database',
      dataTypes: ['keyspaces', 'tables', 'rows', 'columns'],
      capabilities: ['distributed', 'nosql', 'high-availability'],
    },
    dynamodb: {
      name: 'Amazon DynamoDB',
      description: 'NoSQL database service',
      dataTypes: ['tables', 'items', 'queries', 'indexes'],
      capabilities: ['managed', 'serverless', 'scalable'],
    },
    firebase: {
      name: 'Firebase',
      description: 'Google mobile and web platform',
      dataTypes: ['collections', 'documents', 'queries', 'auth'],
      capabilities: ['real-time', 'mobile-focused', 'google-integration'],
    },
  },
};

/**
 * Get all connector types as a flat array
 */
export const getAllConnectorTypes = (): string[] => {
  const types: string[] = [];
  
  Object.values(CONNECTOR_REGISTRY).forEach(category => {
    Object.keys(category).forEach(type => {
      types.push(type);
    });
  });
  
  return types;
};

/**
 * Get connector information by type
 */
export const getConnectorInfo = (type: string) => {
  for (const category of Object.values(CONNECTOR_REGISTRY)) {
    if (category[type]) {
      return category[type];
    }
  }
  return null;
};

/**
 * Get connectors by category
 */
export const getConnectorsByCategory = (category: keyof typeof CONNECTOR_REGISTRY) => {
  return CONNECTOR_REGISTRY[category] || {};
};

/**
 * Get total count of connectors
 */
export const getTotalConnectorCount = (): number => {
  return getAllConnectorTypes().length;
};

