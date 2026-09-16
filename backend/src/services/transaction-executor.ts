import { v4 as uuidv4 } from 'uuid';
import { PaymentRequestDTO, TransactionRecord, AuditEvent, AgentRecord } from '../types/index.js';
import { PolicyEngine } from './policy-engine.js';
import { ChainAdapter } from '../../src/chains/types.js';

export class TransactionExecutor {
  private transactions: Map<string, TransactionRecord> = new Map();
  private dailySpending: Map<string, { spent: string; date: string; count: number }> = new Map();
  private auditLog: AuditEvent[] = [];

  constructor(
    private policyEngine: PolicyEngine,
    private adapters: Map<string, ChainAdapter>,
  ) {}

  async executePayment(agent: AgentRecord, request: PaymentRequestDTO): Promise<TransactionRecord> {
    const txId = uuidv4();
    const now = new Date().toISOString();

    const record: TransactionRecord = {
      id: txId,
      agentId: request.agentId,
      status: 'PENDING',
      request,
      createdAt: now,
      updatedAt: now,
    };
    this.transactions.set(txId, record);

    try {
      const spending = this.getDailySpending(request.agentId);

      const policyResult = this.policyEngine.checkPayment(
        agent.policy,
        request,
        spending.spent,
        spending.count,
      );

      if (!policyResult.approved) {
        record.status = 'REJECTED';
        record.policyRejectionReason = policyResult.reason;
        record.updatedAt = new Date().toISOString();

        this.auditLog.push({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          agentId: request.agentId,
          transactionId: txId,
          eventType: 'POLICY_REJECTION',
          details: { reason: policyResult.reason },
        });

        return record;
      }

      record.status = 'SIMULATING';
      record.updatedAt = new Date().toISOString();

      const adapter = this.adapters.get(agent.chainType);
      if (!adapter) {
        throw new Error(`No adapter found for chain type: ${agent.chainType}`);
      }

      const prepared = await adapter.prepareTransaction({
        from: agent.signerAddress,
        to: request.recipient,
        amount: request.amount,
        asset: request.asset,
        memo: request.memo,
      });
      record.preparedTx = prepared;

      this.auditLog.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        agentId: request.agentId,
        transactionId: txId,
        eventType: 'SIMULATION_START',
        details: { preparedTx: prepared.id },
      });

      const simulation = await adapter.simulateTransaction(prepared);
      record.simulation = simulation;

      this.auditLog.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        agentId: request.agentId,
        transactionId: txId,
        eventType: 'SIMULATION_COMPLETE',
        details: { success: simulation.success, estimatedFee: simulation.estimatedFee },
      });

      if (!simulation.success) {
        record.status = 'FAILED';
        record.result = {
          success: false,
          transactionHash: '',
          status: 'FAILED',
          timestamp: Date.now(),
          error: simulation.error || 'Simulation failed',
        };
        record.updatedAt = new Date().toISOString();
        return record;
      }

      record.status = 'SIGNING';
      record.updatedAt = new Date().toISOString();

      this.auditLog.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        agentId: request.agentId,
        transactionId: txId,
        eventType: 'SIGNING',
        details: { signerAddress: agent.signerAddress },
      });

      record.status = 'SUBMITTING';
      record.updatedAt = new Date().toISOString();

      const result = await adapter.submitTransaction(prepared);
      record.result = result;

      this.auditLog.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        agentId: request.agentId,
        transactionId: txId,
        eventType: 'SUBMISSION',
        details: { hash: result.transactionHash, success: result.success },
      });

      record.status = result.success ? 'CONFIRMED' : 'FAILED';
      record.updatedAt = new Date().toISOString();

      if (result.success) {
        this.updateDailySpending(request.agentId, request.amount);
      }

      return record;
    } catch (error) {
      record.status = 'FAILED';
      record.result = {
        success: false,
        transactionHash: '',
        status: 'FAILED',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      record.updatedAt = new Date().toISOString();

      this.auditLog.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        agentId: request.agentId,
        transactionId: txId,
        eventType: 'FAILURE',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      return record;
    }
  }

  getTransaction(id: string): TransactionRecord | undefined {
    return this.transactions.get(id);
  }

  getTransactionsForAgent(agentId: string): TransactionRecord[] {
    return Array.from(this.transactions.values()).filter((t) => t.agentId === agentId);
  }

  getAllTransactions(): TransactionRecord[] {
    return Array.from(this.transactions.values());
  }

  getAuditLog(): AuditEvent[] {
    return [...this.auditLog];
  }

  private getDailySpending(agentId: string): { spent: string; date: string; count: number } {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.dailySpending.get(agentId);
    if (existing && existing.date === today) {
      return existing;
    }
    return { spent: '0', date: today, count: 0 };
  }

  private updateDailySpending(agentId: string, amount: string): void {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.dailySpending.get(agentId);
    if (existing && existing.date === today) {
      existing.spent = (parseFloat(existing.spent) + parseFloat(amount)).toString();
      existing.count += 1;
    } else {
      this.dailySpending.set(agentId, { spent: amount, date: today, count: 1 });
    }
  }
}
