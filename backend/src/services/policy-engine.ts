import { AgentPolicy } from '../../src/agents/types.js';
import { PaymentRequestDTO, AuditEvent } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface PolicyCheckResult {
  approved: boolean;
  reason?: string;
}

export class PolicyEngine {
  private auditLog: AuditEvent[] = [];

  checkPayment(
    policy: AgentPolicy | undefined,
    request: PaymentRequestDTO,
    currentDailySpent: string,
    _transactionCountToday: number,
  ): PolicyCheckResult {
    if (!policy) {
      return { approved: true };
    }

    if (policy.maxAmountPerTransaction) {
      const max = parseFloat(policy.maxAmountPerTransaction);
      const amount = parseFloat(request.amount);
      if (amount > max) {
        const event: AuditEvent = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          agentId: request.agentId,
          transactionId: '',
          eventType: 'POLICY_REJECTION',
          details: {
            rule: 'maxAmountPerTransaction',
            max,
            attempted: amount,
          },
        };
        this.auditLog.push(event);
        return { approved: false, reason: `Amount ${request.amount} exceeds max per transaction ${policy.maxAmountPerTransaction}` };
      }
    }

    if (policy.dailySpendingLimit) {
      const limit = parseFloat(policy.dailySpendingLimit);
      const spent = parseFloat(currentDailySpent);
      const amount = parseFloat(request.amount);
      if (spent + amount > limit) {
        const event: AuditEvent = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          agentId: request.agentId,
          transactionId: '',
          eventType: 'POLICY_REJECTION',
          details: {
            rule: 'dailySpendingLimit',
            limit,
            currentSpent,
            attempted: amount,
          },
        };
        this.auditLog.push(event);
        return { approved: false, reason: `Daily spending limit ${policy.dailySpendingLimit} would be exceeded (current: ${currentDailySpent})` };
      }
    }

    if (policy.allowedRecipients && policy.allowedRecipients.length > 0) {
      if (!policy.allowedRecipients.includes(request.recipient)) {
        const event: AuditEvent = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          agentId: request.agentId,
          transactionId: '',
          eventType: 'POLICY_REJECTION',
          details: {
            rule: 'allowedRecipients',
            allowed: policy.allowedRecipients,
            attempted: request.recipient,
          },
        };
        this.auditLog.push(event);
        return { approved: false, reason: `Recipient ${request.recipient} is not in allowed recipients list` };
      }
    }

    if (policy.allowedAssets && policy.allowedAssets.length > 0) {
      if (!policy.allowedAssets.includes(request.asset)) {
        const event: AuditEvent = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          agentId: request.agentId,
          transactionId: '',
          eventType: 'POLICY_REJECTION',
          details: {
            rule: 'allowedAssets',
            allowed: policy.allowedAssets,
            attempted: request.asset,
          },
        };
        this.auditLog.push(event);
        return { approved: false, reason: `Asset ${request.asset} is not in allowed assets list` };
      }
    }

    if (policy.requireMemo && !request.memo) {
      const event: AuditEvent = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        agentId: request.agentId,
        transactionId: '',
        eventType: 'POLICY_REJECTION',
        details: {
          rule: 'requireMemo',
        },
      };
      this.auditLog.push(event);
      return { approved: false, reason: 'Memo is required by policy but was not provided' };
    }

    const event: AuditEvent = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      agentId: request.agentId,
      transactionId: '',
      eventType: 'POLICY_CHECK',
      details: { approved: true },
    };
    this.auditLog.push(event);

    return { approved: true };
  }

  getAuditLog(): AuditEvent[] {
    return [...this.auditLog];
  }

  getAuditLogForAgent(agentId: string): AuditEvent[] {
    return this.auditLog.filter((e) => e.agentId === agentId);
  }
}
