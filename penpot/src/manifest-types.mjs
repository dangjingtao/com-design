// Manifest 类型定义。编译产物 build/manifest.json 的结构。
// 同步器按此结构把数据写入 Penpot。

/**
 * @typedef {Object} ManifestTheme
 * @property {string} group       主题组，如 "color-scheme"
 * @property {string} name        主题名，如 "Light" / "Dark"
 * @property {string[]} sets      激活的 token set 名称
 */

/**
 * @typedef {Object} ManifestToken
 * @property {string} set         所属 token set 名
 * @property {string} name        token 名（不含 set 前缀）
 * @property {string} type        Penpot TokenType
 * @property {string|number} value 解析后的具体值
 * @property {string} [sourceId]  真相源标识（com-design 变量名）
 */

/**
 * @typedef {Object} ManifestLibraryColor
 * @property {string} name
 * @property {string} path        分组路径，如 "Brand"
 * @property {string} color       大写 hex
 * @property {number} [opacity]
 * @property {string} sourceId
 */

/**
 * @typedef {Object} ManifestLibraryTypography
 * @property {string} name
 * @property {string} fontFamily
 * @property {string} fontSize
 * @property {string} fontWeight
 * @property {string} lineHeight
 * @property {string} [letterSpacing]
 * @property {string} sourceId
 */

/**
 * @typedef {Object} ManifestComponent
 * @property {string} slug
 * @property {string} name
 * @property {string} [declarationFile]  components/{slug}.penpot.json
 */

/**
 * @typedef {Object} Manifest
 * @property {string} library
 * @property {string} version
 * @property {string} generatedAt
 * @property {ManifestTheme[]} themes
 * @property {ManifestToken[]} tokens
 * @property {ManifestLibraryColor[]} colors
 * @property {ManifestLibraryTypography[]} typographies
 * @property {ManifestComponent[]} components
 */

export {};
