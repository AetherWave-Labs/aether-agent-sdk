'use client';

import { useEffect, useState } from 'react';
import { fetchAgents, createAgent, Agent } from '../lib/api';

export default function PoliciesPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    chainType: 'stellar' as 'stellar' | 'evm',
    network: 'TESTNET',
    signerAddress: '',
    maxAmountPerTransaction: '',
    dailySpendingLimit: '',
    requireMemo: false,
  });

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const agent = await createAgent({
        name: form.name,
        chainType: form.chainType,
        network: form.network,
        signerAddress: form.signerAddress,
        policy: {
          maxAmountPerTransaction: form.maxAmountPerTransaction || undefined,
          dailySpendingLimit: form.dailySpendingLimit || undefined,
          requireMemo: form.requireMemo,
        },
      });
      setAgents([...agents, agent]);
      setShowForm(false);
      setForm({ name: '', chainType: 'stellar', network: 'TESTNET', signerAddress: '', maxAmountPerTransaction: '', dailySpendingLimit: '', requireMemo: false });
    } catch (err) {
      console.error('Failed to create agent:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Policy Configuration</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'New Agent'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Chain Type</label>
              <select
                value={form.chainType}
                onChange={(e) => setForm({ ...form, chainType: e.target.value as 'stellar' | 'evm' })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
              >
                <option value="stellar">Stellar</option>
                <option value="evm">EVM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Network</label>
              <input
                type="text"
                value={form.network}
                onChange={(e) => setForm({ ...form, network: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Signer Address</label>
              <input
                type="text"
                value={form.signerAddress}
                onChange={(e) => setForm({ ...form, signerAddress: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Amount Per TX</label>
              <input
                type="text"
                value={form.maxAmountPerTransaction}
                onChange={(e) => setForm({ ...form, maxAmountPerTransaction: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                placeholder="e.g. 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Daily Spending Limit</label>
              <input
                type="text"
                value={form.dailySpendingLimit}
                onChange={(e) => setForm({ ...form, dailySpendingLimit: e.target.value })}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                placeholder="e.g. 10000"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.requireMemo}
                  onChange={(e) => setForm({ ...form, requireMemo: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Require Memo</span>
              </label>
            </div>
          </div>
          <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Create Agent
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Agent Policies</h3>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
          ) : agents.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No agents configured</div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.chainType} - {agent.network}</p>
                  </div>
                  <div className="text-right text-sm">
                    {agent.policy.maxAmountPerTransaction && (
                      <p>Max/TX: {agent.policy.maxAmountPerTransaction}</p>
                    )}
                    {agent.policy.dailySpendingLimit && (
                      <p>Daily Limit: {agent.policy.dailySpendingLimit}</p>
                    )}
                    {agent.policy.requireMemo && (
                      <p className="text-orange-600">Memo Required</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
