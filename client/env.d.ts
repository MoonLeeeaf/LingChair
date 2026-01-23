/// <reference types="mdui/jsx.zh-cn.d.ts" />
/// <reference types="vite/client" />

// 貌似没有起效
declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                'mdui-patched-textarea': {
                    'value'?: string
                    insertHtml: (html: string) => void
                } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
            }
        }
    }
}

declare const __APP_VERSION__: string
declare const __GIT_HASH__: string
declare const __GIT_HASH_FULL__: string
declare const __GIT_BRANCH__: string
declare const __BUILD_TIME__: string
