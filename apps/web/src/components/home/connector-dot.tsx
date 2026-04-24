type ConnectorDotProps = {
  x: number;
  y: number;
  dotRadius?: number;
  ringRadius?: number;
};

const ConnectorDot = ({
  x,
  y,
  dotRadius = 3,
  ringRadius = 5,
}: ConnectorDotProps) => {
  return (
    <g>
      <circle cx={x} cy={y} r={dotRadius} fill='white' />

      <circle
        cx={x}
        cy={y}
        r={ringRadius}
        fill='none'
        stroke='white'
        strokeWidth='1.5'
        className='animate-pulse-ring'
        opacity='0.8'
      />
    </g>
  );
};

export default ConnectorDot;
