import ConnectorDot from './connector-dot';

type ConnectorLineProps = {
  d: string;
  dot?: {
    x: number;
    y: number;
    dotRadius?: number;
    ringRadius?: number;
  };
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
};

const ConnectorLine = ({
  d,
  dot,
  stroke = 'white',
  strokeWidth = 2,
  opacity = 0.8,
}: ConnectorLineProps) => {
  return (
    <g>
      <path
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill='none'
        opacity={opacity}
      />

      {dot && (
        <ConnectorDot
          x={dot.x}
          y={dot.y}
          dotRadius={dot.dotRadius}
          ringRadius={dot.ringRadius}
        />
      )}
    </g>
  );
};

export default ConnectorLine;
