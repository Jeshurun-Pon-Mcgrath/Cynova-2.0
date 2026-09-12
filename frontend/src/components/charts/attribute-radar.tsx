import { ATTRIBUTES, type PlayerProfile } from "@/types/domain";

export function AttributeRadar({ attributes }: Pick<PlayerProfile, "attributes">) {
  const center = 110;
  const radius = 82;
  const point = (index: number, value: number) => {
    const angle = -Math.PI / 2 + index * Math.PI / 3;
    const scaled = radius * value / 100;
    return `${center + Math.cos(angle) * scaled},${center + Math.sin(angle) * scaled}`;
  };
  const grid = [25, 50, 75, 100].map((value) => ATTRIBUTES.map((_, index) => point(index, value)).join(" "));
  const values = ATTRIBUTES.map((attribute, index) => point(index, attributes[attribute])).join(" ");
  return <div className="radar-wrap"><svg className="radar" viewBox="0 0 220 220" role="img" aria-labelledby="radar-title radar-description"><title id="radar-title">Character attribute radar</title><desc id="radar-description">Six-axis chart of Intellect, Strength, Vitality, Charisma, Creativity, and Discipline.</desc>{grid.map((points) => <polygon key={points} points={points} className="radar-grid"/>)}{ATTRIBUTES.map((_, index) => <line key={index} x1={center} y1={center} x2={point(index, 100).split(",")[0]} y2={point(index, 100).split(",")[1]} className="radar-grid"/>)}<polygon points={values} className="radar-value"/></svg><table className="attribute-table"><caption>Exact attribute values</caption><tbody>{ATTRIBUTES.map((attribute) => <tr key={attribute}><th scope="row">{attribute}</th><td>{attributes[attribute]} / 100</td></tr>)}</tbody></table></div>;
}
