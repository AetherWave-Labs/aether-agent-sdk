'use client';

import { useEffect, useState } from 'react';
import { fetchAgents, Agent } from '../lib/api';

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agent Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Agents</h3>
          <p className="text-3xl font-bold text-indigo-600">{agents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Stellar Agents</h3>
          <p className="text-3xl font-bold text-blue-600">
            {agents.filter((a) => a.chainType === 'stellar').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">EVM Agents</h3>
          <p className="text-3xl font-bold text-purple-600">
            {agents.filter((a) => a.chainType === 'evm').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Agents</h3>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
          ) : agents.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No agents configured</div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-gray-500">{agent.chainType} - {agent.network}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    agent.chainType === 'stellar'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {agent.chainType.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
