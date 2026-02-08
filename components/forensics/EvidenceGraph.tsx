'use client';

import React, { useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { EvidenceNode, EvidenceEdge } from '@root/types/investigation';

interface EvidenceGraphProps {
    initialNodes?: EvidenceNode[];
    initialEdges?: EvidenceEdge[];
    nodes?: EvidenceNode[]; // AI might pass as 'nodes'
    edges?: EvidenceEdge[]; // AI might pass as 'edges'
}

const nodeTypes = {
    // We can add custom node types here later
};

export function EvidenceGraph({ initialNodes, initialEdges, nodes: aiNodes, edges: aiEdges }: EvidenceGraphProps) {
    // Support both prop names
    const rawNodes = aiNodes || initialNodes || [];
    const rawEdges = aiEdges || initialEdges || [];

    // Transform EvidenceNode to ReactFlow Node
    const flowNodes: Node[] = rawNodes.map((n, idx) => ({
        id: n.id,
        type: 'default', // Using default for now
        data: { label: n.label, ...n.data },
        position: { x: 250 + (Math.cos(idx) * 200), y: 250 + (Math.sin(idx) * 200) } // Circular-ish layout
    }));

    const flowEdges: Edge[] = rawEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true,
        style: { stroke: '#00f3ff' },
        labelStyle: { fill: '#fff' }
    }));

    const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

    // Update effect if props change (AI re-renders)
    useEffect(() => {
        setNodes(flowNodes);
        setEdges(flowEdges);
    }, [rawNodes.length, rawEdges.length]);

    if (rawNodes.length === 0) {
        return <div className="text-cyan-500 text-center p-4 border border-cyan-500/30 rounded">Waiting for evidence data...</div>;
    }

    return (
        <div style={{ height: 500, width: '100%', border: '1px solid #00f3ff', borderRadius: '8px', background: '#050a14' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#00f3ff" gap={20} size={1} style={{ opacity: 0.1 }} />
                <Controls style={{ filter: 'invert(1)' }} />
            </ReactFlow>
        </div>
    );
}
