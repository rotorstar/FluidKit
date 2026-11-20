import { resolveTextInsetY, type SceneNode, type TextInkBox } from '@fluidkit/contracts';

export const TEXT_LINE_HEIGHT=1.25;
/** One bounded text region is shared by Glyph rendering and measured QA. */
export function textRegion(node:SceneNode,width:number,height:number,fontSize:number){
  const insetY=resolveTextInsetY(node,height);
  const availableHeight=Math.max(1,height-insetY*2);
  const lines=node.textLines??Math.max(1,Math.floor(availableHeight/(fontSize*TEXT_LINE_HEIGHT)));
  const fittedSize=Math.max(8,Math.min(fontSize,availableHeight/(lines*TEXT_LINE_HEIGHT)));
  return {insetX:node.textInset,insetY,width:Math.max(1,width-node.textInset*2),height:availableHeight,fontSize:fittedSize,maxLines:lines};
}
/** Per-line ink bounds avoid treating paragraph whitespace as visible text. */
export function overlappingText(boxes:readonly TextInkBox[],tolerance=1){
  const pairs:Array<[string,string]>=[];const seen=new Set<string>();
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
    const a=boxes[i]!,b=boxes[j]!;if(a.id===b.id&&a.line===b.line)continue;
    const overlapX=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x);
    const overlapY=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
    const key=[a.id,b.id].sort().join(':');
    if(overlapX>tolerance&&overlapY>tolerance&&!seen.has(key)){pairs.push([a.id,b.id]);seen.add(key);}
  }
  return pairs;
}
/** An immutable visual recording retains its coordinate space at any window size. */
export function recordingScale(recorded:{width:number;height:number},display:{width:number;height:number}){
  return Math.min(display.width/recorded.width,display.height/recorded.height);
}
