import React from 'react';
import {AbsoluteFill, interpolate, useVideoConfig} from 'remotion';
import {TheBoldFont} from '../load-font';
import {fitText} from '@remotion/layout-utils';
import {makeTransform, scale, translateY} from '@remotion/animation-utils';

const fontFamily = TheBoldFont;

export const Word: React.FC<{
	enterProgress: number;
	text: string;
	stroke: boolean;
}> = ({enterProgress, text, stroke}) => {
	const {width} = useVideoConfig();
	const desiredFontSize = 100;

	const fittedText = fitText({
		fontFamily,
		text,
		withinWidth: width * 0.5,
	});

	// const fontSize = Math.min(desiredFontSize, fittedText.fontSize);
	const fontSize = 80

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				top: undefined,
				bottom: 300,
				height: 150,
			}}
		>
			<div
				style={{
					fontSize,
					textAlign: 'center',
					width: '95%',
					color: 'white',
					letterSpacing: 10,
					WebkitTextStroke: stroke ? '10px black' : undefined,
					transform: makeTransform([
						scale(interpolate(enterProgress, [0, 1], [0.5, 1])),
						translateY(interpolate(enterProgress, [0, 1], [10, 0])),
					]),
					fontFamily,
					textTransform: 'uppercase',
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};
