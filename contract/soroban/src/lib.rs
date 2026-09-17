#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol,
};

const AGENT_POLICY: Symbol = symbol_short!("POLICY");
const SPENDING: Symbol = symbol_short!("SPEND");

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum PolicyError {
    NoPolicy = 1,
    AmountExceeded = 2,
    MemoRequired = 3,
    DailyLimitExceeded = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Policy {
    pub max_amount_per_tx: i128,
    pub daily_spending_limit: i128,
    pub require_memo: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendingRecord {
    pub amount: i128,
    pub date: u64,
    pub count: u32,
}

#[contract]
pub struct PolicyGuard;

#[contractimpl]
impl PolicyGuard {
    pub fn set_policy(
        env: Env,
        agent: Address,
        max_amount_per_tx: i128,
        daily_spending_limit: i128,
        require_memo: bool,
    ) {
        let policy = Policy {
            max_amount_per_tx,
            daily_spending_limit,
            require_memo,
        };

        env.storage()
            .persistent()
            .set(&(AGENT_POLICY, agent), &policy);
    }

    pub fn get_policy(env: Env, agent: Address) -> Option<Policy> {
        env.storage().persistent().get(&(AGENT_POLICY, agent))
    }

    pub fn check_transaction(
        env: Env,
        agent: Address,
        amount: i128,
        has_memo: bool,
    ) -> Result<bool, PolicyError> {
        let policy: Policy = env
            .storage()
            .persistent()
            .get(&(AGENT_POLICY, agent.clone()))
            .ok_or(PolicyError::NoPolicy)?;

        if amount > policy.max_amount_per_tx && policy.max_amount_per_tx > 0 {
            return Err(PolicyError::AmountExceeded);
        }

        if policy.require_memo && !has_memo {
            return Err(PolicyError::MemoRequired);
        }

        let today = env.ledger().timestamp() / 86_400;

        let record: SpendingRecord = env
            .storage()
            .persistent()
            .get(&(SPENDING, agent.clone(), today))
            .unwrap_or(SpendingRecord {
                amount: 0,
                date: today,
                count: 0,
            });

        if record.amount + amount > policy.daily_spending_limit && policy.daily_spending_limit > 0 {
            return Err(PolicyError::DailyLimitExceeded);
        }

        Ok(true)
    }

    pub fn record_transaction(env: Env, agent: Address, amount: i128) {
        let today = env.ledger().timestamp() / 86_400;

        let mut record: SpendingRecord = env
            .storage()
            .persistent()
            .get(&(SPENDING, agent.clone(), today))
            .unwrap_or(SpendingRecord {
                amount: 0,
                date: today,
                count: 0,
            });

        record.amount += amount;
        record.count += 1;

        env.storage()
            .persistent()
            .set(&(SPENDING, agent, today), &record);
    }

    pub fn get_spending(env: Env, agent: Address) -> SpendingRecord {
        let today = env.ledger().timestamp() / 86_400;

        env.storage()
            .persistent()
            .get(&(SPENDING, agent, today))
            .unwrap_or(SpendingRecord {
                amount: 0,
                date: today,
                count: 0,
            })
    }
}
