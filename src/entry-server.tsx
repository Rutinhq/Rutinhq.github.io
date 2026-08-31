import { HelmetProvider, type HelmetServerState } from '@dr.pogodin/react-helmet'
import { renderToString } from 'react-dom/server'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import './lib/i18n'
import i18n from './lib/i18n'
import { defaultLanguage } from './lib/i18n/config'

export async function render(url: string, lang?: string) {
  await i18n.changeLanguage(lang || defaultLanguage)

  let helmetState: HelmetServerState | undefined
  const html = renderToString(
    <HelmetProvider
      onServerState={(state) => {
        helmetState = state
      }}
    >
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[url]}>
          <App />
        </MemoryRouter>
      </I18nextProvider>
    </HelmetProvider>,
  )

  const head = [
    helmetState?.title.toString() ?? '',
    helmetState?.meta.toString() ?? '',
    helmetState?.link.toString() ?? '',
    helmetState?.script.toString() ?? '',
    helmetState?.htmlAttributes.toString()
      ? `<html ${helmetState.htmlAttributes.toString()} />`.replace(
          '<html ',
          '',
        )
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  return { html, head, htmlAttributes: helmetState?.htmlAttributes.toString() ?? '' }
}
