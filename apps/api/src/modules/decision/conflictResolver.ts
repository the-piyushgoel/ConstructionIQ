import { AgentResponse } from '../agents/agent.types';
import { Conflict } from './decision.types';

export class ConflictResolver {
  detectConflicts(responses: AgentResponse[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const agentA = responses[i];
        const agentB = responses[j];

        // 1. Confidence Conflict (Diff > 30)
        if (Math.abs(agentA.confidence.score - agentB.confidence.score) > 30) {
          conflicts.push({
            category: 'CONFIDENCE_CONFLICT',
            description: 'Significant difference in confidence scores.',
            involvedAgents: [agentA.agentName, agentB.agentName]
          });
        }

        const recsA = agentA.recommendations;
        const recsB = agentB.recommendations;

        for (const recA of recsA) {
          for (const recB of recsB) {
            // Target matches
            if (recA.target === recB.target) {
              // 2. Recommendation Conflict (same target, different action)
              if (recA.action !== recB.action) {
                conflicts.push({
                  category: 'RECOMMENDATION_CONFLICT',
                  description: `Conflicting actions for target ${recA.target}: ${recA.action} vs ${recB.action}`,
                  involvedAgents: [agentA.agentName, agentB.agentName]
                });
              } else if (recA.impact !== recB.impact) {
                // 3. Impact Conflict (same target, same action, different impact)
                conflicts.push({
                  category: 'IMPACT_CONFLICT',
                  description: `Conflicting impacts for target ${recA.target}: ${recA.impact} vs ${recB.impact}`,
                  involvedAgents: [agentA.agentName, agentB.agentName]
                });
              }
            }
          }
        }
        
        // 4. Assumption Conflict (Check disjoint assumptions)
        const asmptA = recsA.flatMap(r => r.assumptions || []);
        const asmptB = recsB.flatMap(r => r.assumptions || []);
        // Very basic assumption clash check (e.g., mutually exclusive keywords)
        // Since we are not using AI, we just flag if both have assumptions but no intersection
        if (asmptA.length > 0 && asmptB.length > 0) {
          const intersection = asmptA.filter(a => asmptB.includes(a));
          if (intersection.length === 0) {
             // In a real deterministic rule engine we'd look for antonyms. Here we just flag completely disjoint assumption sets as potential conflict.
             conflicts.push({
              category: 'ASSUMPTION_CONFLICT',
              description: 'Agents have completely disjoint assumptions.',
              involvedAgents: [agentA.agentName, agentB.agentName]
            });
          }
        }
      }
    }

    // Deduplicate conflicts by description
    const uniqueConflicts = Array.from(new Map(conflicts.map(c => [c.description, c])).values());
    return uniqueConflicts;
  }
}
