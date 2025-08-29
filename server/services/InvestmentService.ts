import { supabase } from '../config/database';
import { Investment } from '../types/financial';

export interface MarketData {
  symbol: string;
  current_price: number;
  change_percent: number;
  volume: number;
  last_updated: string;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  by_type: Record<string, { invested: number; current_value: number; count: number }>;
  performance_metrics: {
    best_performer: Investment | null;
    worst_performer: Investment | null;
    average_performance: number;
  };
}

export class InvestmentService {
  static async getPortfolioSummary(foundationId: string): Promise<PortfolioSummary> {
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
      .eq('foundation_id', foundationId);

    if (error) {
      throw new Error(`Failed to fetch investments: ${error.message}`);
    }

    const summary: PortfolioSummary = {
      total_invested: 0,
      current_value: 0,
      total_gain_loss: 0,
      total_gain_loss_percent: 0,
      by_type: {},
      performance_metrics: {
        best_performer: null,
        worst_performer: null,
        average_performance: 0
      }
    };

    if (!investments || investments.length === 0) {
      return summary;
    }

    // Calculate totals
    investments.forEach(investment => {
      const currentValue = investment.current_value || investment.amount;
      summary.total_invested += investment.amount;
      summary.current_value += currentValue;

      // Group by type
      if (!summary.by_type[investment.type]) {
        summary.by_type[investment.type] = { invested: 0, current_value: 0, count: 0 };
      }
      summary.by_type[investment.type].invested += investment.amount;
      summary.by_type[investment.type].current_value += currentValue;
      summary.by_type[investment.type].count += 1;
    });

    summary.total_gain_loss = summary.current_value - summary.total_invested;
    summary.total_gain_loss_percent = summary.total_invested > 0 
      ? (summary.total_gain_loss / summary.total_invested) * 100 
      : 0;

    // Find best and worst performers
    const investmentsWithPerformance = investments.filter(inv => inv.performance !== null);
    if (investmentsWithPerformance.length > 0) {
      summary.performance_metrics.best_performer = investmentsWithPerformance.reduce((best, current) => 
        (current.performance || 0) > (best.performance || 0) ? current : best
      );
      
      summary.performance_metrics.worst_performer = investmentsWithPerformance.reduce((worst, current) => 
        (current.performance || 0) < (worst.performance || 0) ? current : worst
      );

      summary.performance_metrics.average_performance = 
        investmentsWithPerformance.reduce((sum, inv) => sum + (inv.performance || 0), 0) / 
        investmentsWithPerformance.length;
    }

    return summary;
  }

  static async updateInvestmentValues(foundationId: string): Promise<Investment[]> {
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
      .eq('foundation_id', foundationId)
      .eq('type', 'stock'); // Only update stocks for now

    if (error) {
      throw new Error(`Failed to fetch investments: ${error.message}`);
    }

    const updatedInvestments: Investment[] = [];

    for (const investment of investments || []) {
      // In a real implementation, this would fetch current market prices
      const marketData = await this.fetchMarketData(investment.name);
      
      if (marketData) {
        const newValue = investment.amount * (1 + (marketData.change_percent / 100));
        const performance = ((newValue - investment.amount) / investment.amount) * 100;

        const { data: updated, error: updateError } = await supabase
          .from('investments')
          .update({
            current_value: newValue,
            performance: performance,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.id)
          .select()
          .single();

        if (!updateError && updated) {
          updatedInvestments.push(updated);
        }
      }
    }

    return updatedInvestments;
  }

  private static async fetchMarketData(investmentName: string): Promise<MarketData | null> {
    // In a real implementation, this would call a financial data API
    // For now, return mock data
    const mockData: MarketData = {
      symbol: investmentName.toUpperCase().replace(/\s+/g, ''),
      current_price: Math.random() * 1000 + 100,
      change_percent: (Math.random() - 0.5) * 10, // -5% to +5%
      volume: Math.floor(Math.random() * 1000000),
      last_updated: new Date().toISOString()
    };

    return mockData;
  }

  static async calculatePortfolioRisk(foundationId: string): Promise<Record<string, any>> {
    const { data: investments, error } = await supabase
      .from('investments')
      .select('type, amount, performance')
      .eq('foundation_id', foundationId);

    if (error) {
      throw new Error(`Failed to fetch investments: ${error.message}`);
    }

    const riskAnalysis = {
      overall_risk: 'medium',
      diversification_score: 0,
      volatility_score: 0,
      recommendations: [] as string[]
    };

    if (!investments || investments.length === 0) {
      return riskAnalysis;
    }

    // Calculate diversification
    const typeCount = new Set(investments.map(inv => inv.type)).size;
    riskAnalysis.diversification_score = Math.min(typeCount / 5, 1) * 100; // Max 5 types

    // Calculate volatility based on performance variance
    const performances = investments
      .filter(inv => inv.performance !== null)
      .map(inv => inv.performance || 0);

    if (performances.length > 1) {
      const avgPerformance = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
      const variance = performances.reduce((sum, perf) => sum + Math.pow(perf - avgPerformance, 2), 0) / performances.length;
      riskAnalysis.volatility_score = Math.sqrt(variance);
    }

    // Generate recommendations
    if (riskAnalysis.diversification_score < 60) {
      riskAnalysis.recommendations.push('Consider diversifying across more asset types');
    }
    if (riskAnalysis.volatility_score > 15) {
      riskAnalysis.recommendations.push('Portfolio shows high volatility - consider more stable investments');
    }

    // Determine overall risk
    if (riskAnalysis.volatility_score > 20 || riskAnalysis.diversification_score < 40) {
      riskAnalysis.overall_risk = 'high';
    } else if (riskAnalysis.volatility_score < 10 && riskAnalysis.diversification_score > 70) {
      riskAnalysis.overall_risk = 'low';
    }

    return riskAnalysis;
  }

  static async generateInvestmentReport(
    foundationId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, any>> {
    const portfolioSummary = await this.getPortfolioSummary(foundationId);
    const riskAnalysis = await this.calculatePortfolioRisk(foundationId);

    return {
      foundation_id: foundationId,
      period_start: startDate,
      period_end: endDate,
      generated_at: new Date().toISOString(),
      portfolio_summary: portfolioSummary,
      risk_analysis: riskAnalysis,
      recommendations: riskAnalysis.recommendations
    };
  }

  static async rebalancePortfolio(
    foundationId: string,
    targetAllocations: Record<string, number>
  ): Promise<Record<string, any>> {
    const portfolioSummary = await this.getPortfolioSummary(foundationId);
    const rebalanceActions: any[] = [];

    Object.entries(targetAllocations).forEach(([type, targetPercent]) => {
      const currentAllocation = portfolioSummary.by_type[type];
      const currentPercent = currentAllocation 
        ? (currentAllocation.current_value / portfolioSummary.current_value) * 100 
        : 0;

      const difference = targetPercent - currentPercent;
      const amountToAdjust = (difference / 100) * portfolioSummary.current_value;

      if (Math.abs(difference) > 5) { // Only suggest rebalancing if difference > 5%
        rebalanceActions.push({
          asset_type: type,
          current_percent: currentPercent,
          target_percent: targetPercent,
          action: difference > 0 ? 'buy' : 'sell',
          amount: Math.abs(amountToAdjust)
        });
      }
    });

    return {
      foundation_id: foundationId,
      current_portfolio: portfolioSummary,
      target_allocations: targetAllocations,
      rebalance_actions: rebalanceActions,
      generated_at: new Date().toISOString()
    };
  }
}