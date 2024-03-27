import type {AxiosResponse} from 'axios';

type TDownloadFileProps = {
	apiDefinition: () => Promise<AxiosResponse<Blob>>;
	preDownloading?: () => void;
	postDownloading?: () => void;
	onError?: () => void;
	fileType: string;
	fileName?: string;
};

type TDownloadedFileInfo = {
	download: () => Promise<void>;
};

// TODO: move to lib
export const useDownloadFile = ({
	apiDefinition,
	preDownloading,
	postDownloading,
	onError,
	fileType,
	fileName = 'Token Asset'
}: TDownloadFileProps): TDownloadedFileInfo => {
	const download = async (): Promise<void> => {
		try {
			preDownloading?.();
			const {data} = await apiDefinition();
			const url = URL.createObjectURL(new Blob([data]));
			const link = document.createElement('a');
			link.download = `${fileName}.${fileType}`;
			link.href = url;
			link.click();
			link.parentElement?.removeChild(link);
			postDownloading?.();
		} catch (error) {
			onError?.();
		}
	};

	return {download};
};
