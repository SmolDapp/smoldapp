import Document, {Head, Html, Main, NextScript} from 'next/document';
import PatternBackground from 'components/icons/PatternBackground';

import type {DocumentContext, DocumentInitialProps} from 'next/document';
import type {ReactElement} from 'react';

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
		const initialProps = await Document.getInitialProps(ctx);
		return {...initialProps};
	}

	render(): ReactElement {
		return (
			<Html lang={'en'}>
				<Head>
					<link
						rel={'preconnect'}
						href={'https://fonts.googleapis.com'}
					/>
					<link
						rel={'preconnect'}
						href={'https://fonts.gstatic.com'}
						crossOrigin={'anonymous'}
					/>
					<link
						href={'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap'}
						rel={'stylesheet'}
					/>
				</Head>
				<body className={'bg-primary-50 transition-colors duration-150'}>
					<PatternBackground />
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
