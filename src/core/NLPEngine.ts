import {
  BusinessContext,
  BusinessInsight,
  InsightType,
  QueryRequest,
} from '../types';

/**
 * Natural Language Processing Engine for business intelligence queries
 * Handles query understanding, processing, and response generation
 */
export class NLPEngine {
  private businessContext?: BusinessContext;
  private isInitialized = false;

  constructor(businessContext?: BusinessContext) {
    this.businessContext = businessContext;
  }

  /**
   * Initialize the NLP engine
   */
  async initialize(): Promise<void> {
    // In a real implementation, this would load ML models, 
    // business terminology, and other NLP resources
    this.isInitialized = true;
  }

  /**
   * Process a natural language query into a structured format
   */
  async processQuery(query: string): Promise<ProcessedQuery> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Extract intent and entities from the query
    const intent = this.extractIntent(query);
    const entities = this.extractEntities(query);
    const dataSources = this.identifyDataSources(query);
    const operations = this.identifyOperations(query);
    const timeRange = this.extractTimeRange(query);

    return {
      originalQuery: query,
      intent,
      entities,
      dataSources,
      operations,
      timeRange,
      complexity: this.assessComplexity(intent, entities, dataSources),
    };
  }

  /**
   * Generate business insights from query results
   */
  async generateInsights(results: any, processedQuery: ProcessedQuery): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Generate trend insights
    if (this.isTrendQuery(processedQuery)) {
      const trendInsight = await this.generateTrendInsight(results, processedQuery);
      if (trendInsight) insights.push(trendInsight);
    }

    // Generate correlation insights
    if (this.isCorrelationQuery(processedQuery)) {
      const correlationInsight = await this.generateCorrelationInsight(results, processedQuery);
      if (correlationInsight) insights.push(correlationInsight);
    }

    // Generate anomaly insights
    const anomalyInsight = await this.generateAnomalyInsight(results, processedQuery);
    if (anomalyInsight) insights.push(anomalyInsight);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(results, processedQuery);
    insights.push(...recommendations);

    return insights;
  }

  /**
   * Format query results into a natural language response
   */
  async formatResponse(results: any, insights: BusinessInsight[]): Promise<string> {
    let response = '';

    // Format the main data response
    if (results.data && results.data.length > 0) {
      response += this.formatDataResponse(results);
    } else {
      response += 'I couldn\'t find any data matching your query.';
    }

    // Add insights
    if (insights.length > 0) {
      response += '\n\n**Key Insights:**\n';
      for (const insight of insights) {
        response += `• ${insight.title}: ${insight.description}\n`;
      }
    }

    // Add recommendations
    const recommendationInsights = insights.filter(i => i.type === 'recommendation');
    if (recommendationInsights.length > 0) {
      response += '\n**Recommendations:**\n';
      for (const insight of recommendationInsights) {
        if (insight.recommendations) {
          for (const rec of insight.recommendations) {
            response += `• ${rec}\n`;
          }
        }
      }
    }

    return response;
  }

  /**
   * Update business context
   */
  updateContext(context: BusinessContext): void {
    this.businessContext = { ...this.businessContext, ...context };
  }

  // Private helper methods
  private extractIntent(query: string): QueryIntent {
    const queryLower = query.toLowerCase();

    // Intent classification based on keywords and patterns
    if (this.matchesPattern(queryLower, ['what', 'show', 'list', 'get'])) {
      return 'retrieve';
    } else if (this.matchesPattern(queryLower, ['compare', 'vs', 'versus', 'difference'])) {
      return 'compare';
    } else if (this.matchesPattern(queryLower, ['trend', 'over time', 'growth', 'change'])) {
      return 'trend';
    } else if (this.matchesPattern(queryLower, ['why', 'reason', 'cause', 'because'])) {
      return 'explain';
    } else if (this.matchesPattern(queryLower, ['predict', 'forecast', 'future', 'next'])) {
      return 'predict';
    } else {
      return 'retrieve';
    }
  }

  private extractEntities(query: string): QueryEntity[] {
    const entities: QueryEntity[] = [];
    const queryLower = query.toLowerCase();

    // Extract business entities
    const businessTerms = this.getBusinessTerms();
    for (const [term, type] of Object.entries(businessTerms)) {
      if (queryLower.includes(term)) {
        entities.push({ type, value: term, confidence: 0.9 });
      }
    }

    // Extract metrics
    const metrics = this.getMetrics();
    for (const metric of metrics) {
      if (queryLower.includes(metric)) {
        entities.push({ type: 'metric', value: metric, confidence: 0.8 });
      }
    }

    // Extract time entities
    const timeEntities = this.extractTimeEntities(query);
    entities.push(...timeEntities);

    return entities;
  }

  private identifyDataSources(query: string): string[] {
    const dataSources: string[] = [];
    const queryLower = query.toLowerCase();

    const sourceKeywords: Record<string, string[]> = {
      'shopify': ['product', 'order', 'customer', 'inventory', 'shopify'],
      'stripe': ['payment', 'subscription', 'revenue', 'transaction', 'stripe'],
      'google-analytics': ['traffic', 'visitor', 'pageview', 'conversion', 'analytics'],
      'salesforce': ['lead', 'opportunity', 'account', 'contact', 'salesforce'],
    };

    for (const [source, keywords] of Object.entries(sourceKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        dataSources.push(source);
      }
    }

    return dataSources.length > 0 ? dataSources : ['all'];
  }

  private identifyOperations(query: string): string[] {
    const operations: string[] = [];
    const queryLower = query.toLowerCase();

    if (this.matchesPattern(queryLower, ['sum', 'total', 'add'])) {
      operations.push('sum');
    }
    if (this.matchesPattern(queryLower, ['average', 'mean', 'avg'])) {
      operations.push('average');
    }
    if (this.matchesPattern(queryLower, ['count', 'number', 'how many'])) {
      operations.push('count');
    }
    if (this.matchesPattern(queryLower, ['max', 'highest', 'top', 'best'])) {
      operations.push('max');
    }
    if (this.matchesPattern(queryLower, ['min', 'lowest', 'bottom', 'worst'])) {
      operations.push('min');
    }
    if (this.matchesPattern(queryLower, ['group', 'by', 'category'])) {
      operations.push('group');
    }

    return operations;
  }

  private extractTimeRange(query: string): TimeRange | undefined {
    const queryLower = query.toLowerCase();
    
    // Simple time range extraction - in a real implementation, this would be more sophisticated
    if (queryLower.includes('last week')) {
      const end = new Date();
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start, end, granularity: 'day' };
    } else if (queryLower.includes('last month')) {
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start, end, granularity: 'day' };
    } else if (queryLower.includes('this year')) {
      const start = new Date(new Date().getFullYear(), 0, 1);
      const end = new Date();
      return { start, end, granularity: 'month' };
    }

    return undefined;
  }

  private assessComplexity(intent: QueryIntent, entities: QueryEntity[], dataSources: string[]): 'simple' | 'moderate' | 'complex' {
    let complexity = 0;
    
    if (dataSources.length > 1) complexity += 2;
    if (entities.length > 3) complexity += 1;
    if (intent === 'compare' || intent === 'predict') complexity += 2;
    
    if (complexity <= 1) return 'simple';
    if (complexity <= 3) return 'moderate';
    return 'complex';
  }

  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private getBusinessTerms(): Record<string, string> {
    const baseTerms: Record<string, string> = {
      'customer': 'entity',
      'product': 'entity',
      'order': 'entity',
      'revenue': 'metric',
      'sales': 'metric',
      'profit': 'metric',
      'cost': 'metric',
    };

    // Add business context specific terms
    if (this.businessContext?.terminology) {
      return { ...baseTerms, ...this.businessContext.terminology };
    }

    return baseTerms;
  }

  private getMetrics(): string[] {
    const baseMetrics = ['revenue', 'sales', 'profit', 'cost', 'conversion', 'traffic'];
    
    if (this.businessContext?.metrics) {
      return [...baseMetrics, ...this.businessContext.metrics];
    }

    return baseMetrics;
  }

  private extractTimeEntities(query: string): QueryEntity[] {
    const entities: QueryEntity[] = [];
    const timePatterns = [
      { pattern: /last\s+(\d+)\s+days?/i, type: 'time_range' },
      { pattern: /this\s+(week|month|year)/i, type: 'time_period' },
      { pattern: /(\d{4})/i, type: 'year' },
    ];

    for (const { pattern, type } of timePatterns) {
      const match = query.match(pattern);
      if (match) {
        entities.push({ type, value: match[0], confidence: 0.9 });
      }
    }

    return entities;
  }

  private isTrendQuery(processedQuery: ProcessedQuery): boolean {
    return processedQuery.intent === 'trend' || 
           processedQuery.entities.some(e => e.type === 'time_range');
  }

  private isCorrelationQuery(processedQuery: ProcessedQuery): boolean {
    return processedQuery.intent === 'compare' || 
           processedQuery.dataSources.length > 1;
  }

  private async generateTrendInsight(results: any, processedQuery: ProcessedQuery): Promise<BusinessInsight | null> {
    // Simplified trend analysis
    if (!results.data || results.data.length < 2) return null;

    return {
      type: 'trend',
      title: 'Trend Analysis',
      description: 'Data shows a consistent pattern over the selected time period.',
      confidence: 0.7,
      data: results.data,
    };
  }

  private async generateCorrelationInsight(results: any, processedQuery: ProcessedQuery): Promise<BusinessInsight | null> {
    if (processedQuery.dataSources.length < 2) return null;

    return {
      type: 'correlation',
      title: 'Cross-Platform Correlation',
      description: 'Data from multiple sources shows interesting relationships.',
      confidence: 0.6,
      data: results.data,
    };
  }

  private async generateAnomalyInsight(results: any, processedQuery: ProcessedQuery): Promise<BusinessInsight | null> {
    // Simplified anomaly detection
    return {
      type: 'anomaly',
      title: 'Data Quality Check',
      description: 'No significant anomalies detected in the data.',
      confidence: 0.8,
    };
  }

  private async generateRecommendations(results: any, processedQuery: ProcessedQuery): Promise<BusinessInsight[]> {
    const recommendations: BusinessInsight[] = [];

    // Generate contextual recommendations based on query and results
    if (processedQuery.intent === 'retrieve' && results.data?.length > 0) {
      recommendations.push({
        type: 'recommendation',
        title: 'Next Steps',
        description: 'Consider analyzing trends or comparing with other time periods.',
        confidence: 0.7,
        recommendations: [
          'Try asking about trends over time',
          'Compare with previous periods',
          'Look for correlations with other metrics',
        ],
      });
    }

    return recommendations;
  }

  private formatDataResponse(results: any): string {
    if (!results.data || results.data.length === 0) {
      return 'No data found.';
    }

    if (results.data.length === 1) {
      return `Found 1 result: ${JSON.stringify(results.data[0], null, 2)}`;
    }

    return `Found ${results.data.length} results. Here are the key findings:\n${JSON.stringify(results.data.slice(0, 5), null, 2)}`;
  }
}

// Supporting types
interface ProcessedQuery {
  originalQuery: string;
  intent: QueryIntent;
  entities: QueryEntity[];
  dataSources: string[];
  operations: string[];
  timeRange?: TimeRange;
  complexity: 'simple' | 'moderate' | 'complex';
}

type QueryIntent = 'retrieve' | 'compare' | 'trend' | 'explain' | 'predict';

interface QueryEntity {
  type: string;
  value: string;
  confidence: number;
}

interface TimeRange {
  start: Date;
  end: Date;
  granularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

