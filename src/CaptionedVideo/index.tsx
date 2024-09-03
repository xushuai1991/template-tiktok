import {useCallback, useEffect, useState} from 'react';
import {
	AbsoluteFill,
	CalculateMetadataFunction,
	cancelRender,
	continueRender,
	delayRender,
	getStaticFiles,
	OffthreadVideo,
	Sequence,
	useVideoConfig,
	watchStaticFile,
} from 'remotion';
import {z} from 'zod';
import Subtitle from './Subtitle';
import {getVideoMetadata} from '@remotion/media-utils';
import {loadFont} from '../load-font';

export type SubtitleProp = {
	startInSeconds: number;
	text: string;
};

export const captionedVideoSchema = z.object({
	src: z.string(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
	z.infer<typeof captionedVideoSchema>
> = async ({props}) => {
	const fps = 30;
	const metadata = await getVideoMetadata(props.src);

	return {
		fps,
		durationInFrames: Math.floor(metadata.durationInSeconds * fps),
	};
};

const getFileExists = (file: string) => {
	const files = getStaticFiles();
	const fileExists = files.find((f) => {
		return f.src === file;
	});
	return Boolean(fileExists);
};

export const CaptionedVideo: React.FC<{
	src: string;
}> = ({src}) => {
	const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);
	const [handle] = useState(() => delayRender());
	const {fps} = useVideoConfig();

	const subtitlesFile = src
		.replace(/.mp4$/, '.json')
		.replace(/.mkv$/, '.json')
		.replace(/.mov$/, '.json')
		.replace(/.webm$/, '.json');

	const fetchSubtitles = useCallback(async () => {
		try {
			await loadFont();
			const res = await fetch(subtitlesFile);
			const data = await res.json();
			// console.error(111, data)
			// alert(JSON.stringify(data))
			setSubtitles(data.transcription);
			continueRender(handle);
		} catch (e) {
			cancelRender(e);
		}
	}, [handle, subtitlesFile]);

	useEffect(() => {
		fetchSubtitles();

		const c = watchStaticFile(subtitlesFile, () => {
			fetchSubtitles();
		});

		return () => {
			c.cancel();
		};
	}, [fetchSubtitles, src, subtitlesFile]);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill>
				<OffthreadVideo
					style={{
						objectFit: 'cover',
					}}
					src={src}
				/>
			</AbsoluteFill>
			{subtitles.map((subtitle, index) => {
				const nextSubtitle = subtitles[index + 1] ?? null;
				// const subtitleStartFrame = subtitle.startInSeconds * fps;
				// const subtitleEndFrame = Math.min(
				// 	nextSubtitle ? nextSubtitle.startInSeconds * fps : Infinity,
				// 	// subtitleStartFrame + fps,
				// );
				
				const subtitleStartFrame = subtitle.offsets.from/1000 * fps;
				const subtitleEndFrame = Math.min(
					nextSubtitle ? nextSubtitle.offsets.from/1000 * fps : Infinity,
					// subtitleStartFrame + fps,
				);
				const durationInFrames = subtitleEndFrame - subtitleStartFrame;
				// if (index == 0) {
				// 	alert(subtitleEndFrame)
				// 	// alert(subtitleStartFrame)

				// 	// alert(JSON.stringify(subtitle))
				// }
				
				if (durationInFrames <= 0) {
					return null;
				}
				console.log(durationInFrames)

				return (
					<Sequence
						from={subtitleStartFrame}
						durationInFrames={durationInFrames}
					>
						<Subtitle key={index} text={subtitle.text} />;
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};
