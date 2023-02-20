import React from 'react';
import Document, {Head, Html, Main, NextScript} from 'next/document';
import PatternBackground from 'components/icons/PatternBackground';

import type {DocumentContext, DocumentInitialProps} from 'next/document';
import type {ReactElement} from 'react';

const modeScript = `
  let darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  updateMode()
  darkModeMediaQuery.addEventListener('change', updateModeWithoutTransitions)
  window.addEventListener('storage', updateModeWithoutTransitions)

  function updateMode() {
    let isSystemDarkMode = darkModeMediaQuery.matches
    let isDarkMode = window.localStorage.isDarkMode === 'true' || (!('isDarkMode' in window.localStorage) && isSystemDarkMode)

    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
    //   document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isDarkMode === isSystemDarkMode) {
      delete window.localStorage.isDarkMode
    }
  }

  function updateModeWithoutTransitions() {
    updateMode()
  }
`;

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
		const initialProps = await Document.getInitialProps(ctx);
		return {...initialProps};
	}

	render(): ReactElement {
		return (
			<Html lang={'en'}>
				<Head>
					<link rel={'preconnect'} href={'https://fonts.googleapis.com'} />
					<link
						rel={'preconnect'}
						href={'https://fonts.gstatic.com'}
						crossOrigin={'anonymous'} />
					<link href={'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400,700&display=swap'} rel={'stylesheet'} />
					<script dangerouslySetInnerHTML={{__html: modeScript}} />
				</Head>
				<body className={'bg-neutral-0 transition-colors duration-150'}>
					<PatternBackground />
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
