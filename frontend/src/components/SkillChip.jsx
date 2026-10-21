export default function SkillChip({ name, ok }) {
  return <span className={`chip ${ok ? "ok" : "no"}`}>{name}</span>;
}