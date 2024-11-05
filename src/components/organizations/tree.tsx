'use client'

import { use, useEffect, useRef, useState } from 'react';
import { RawNodeDatum, SyntheticEventHandler, TreeNodeDatum } from 'react-d3-tree';

import dynamic from "next/dynamic"
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card';
import './tree.css'
import { useRouter } from 'next/navigation';

const Tree = dynamic(
  () => import('react-d3-tree'),
  { ssr: false }
)
export default function OrgTree({data}: {data: RawNodeDatum}) {
  const { push } = useRouter();

  const [treeState, setTreeState] = useState({translate: {x: 0, y:0}})

  const treeContainer = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (treeContainer.current) {
          const dimensions = treeContainer.current.getBoundingClientRect();
          setTreeState({
              translate: {
                  x: dimensions.width / 2,
                  y: dimensions.height / 4
              }
          });
      }
  }, [data]);

  const handleNodeClick = (node: any) => {
    push('/organizations/members/' + node.data.attributes.id)
  }


  return (
    <div id="treeWrapper1"  style={{height: '500px' }} className='border-2 m-5'  ref={treeContainer}>
        <Tree 
            onNodeClick={handleNodeClick}
            renderCustomNodeElement={renderNodeWithHoverCard} 
            data={data} 
            translate={treeState.translate} 
            orientation='vertical' 
            pathFunc='step'
            draggable={true} 
            depthFactor={90}
            scaleExtent={	{min: 0.5, max: 1.5}}
            collapsible={false}
            separation={{
              siblings: 3
            }}
            rootNodeClassName="node__root"
            branchNodeClassName="node__branch"
            leafNodeClassName="node__leaf"
    
            />
    </div>

  )
} 


const renderNodeWithHoverCard = ({ nodeDatum, toggleNode, onNodeClick}: {nodeDatum: TreeNodeDatum, toggleNode: () => void, onNodeClick: SyntheticEventHandler}) => {
  
  return (
    <>
      <g onClick={onNodeClick}>
        <CustomNode nodeDatum={nodeDatum}></CustomNode>
      </g>
    </>
  );
};



function CustomNode({ nodeDatum }: {nodeDatum: TreeNodeDatum}) {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <>
      <g onMouseOver={() => setIsHovering(true)} onMouseOut={() => setIsHovering(false)}>
        <circle r={isHovering ? 7: 3} strokeWidth={2} fill={isHovering ? 'white' : 'black'} stroke="black" />
        <text x="15" y="0" strokeWidth={isHovering ? 1 : 0.8}>{isHovering ? `${nodeDatum.name}` : (nodeDatum.attributes && nodeDatum.attributes.pos)}</text>
        <text strokeWidth="0.1" x="15" y="20">{nodeDatum.attributes && nodeDatum.attributes.org}</text>
      </g>
    </>
  );

} 