export default function ScoreSticker({ score, penalty }) {
  return (
    <div>
      <div className="score">
        <b>{Number(score).toFixed(1)}%</b>
        <span>Match score</span>
      </div>
      {penalty && <div className="tag no" style={{ marginTop: 14 }}>Too long (max 1 page)</div>}
    </div>
  );
}