## How to add Source organism filter:
Go to ApexDbFilters.tsx and uncomment the line with the filter:

from:
```
{/*<TextInput label="Source organism" placeholder="Enter source organism name"*/}
{/*           onChange={(event) => handleTextFilterChange('sourceOrganism', event.target.value)}/>*/}
```
to:
```
<TextInput label="Source organism" placeholder="Enter source organism name"
           onChange={(event) => handleTextFilterChange('sourceOrganism', event.target.value)}/>
```


uncomment source organism line in db-service.ts:
from:
```
// sourceOrganism: undefined,
```
to: 
```
sourceOrganism: undefined,
```

uncomment source organism line in models.ts:
from: 
```angular2html
// sourceOrganism: string
```
to:
```
sourceOrganism: string
```

uncomment source organism filter rule in logic.ts:
from 
```
// (!filters.sourceOrganism || entry.sourceOrganism.toLowerCase().includes(filters.sourceOrganism.toLowerCase()))
```
to:
```
&& (!filters.sourceOrganism || entry.sourceOrganism.toLowerCase().includes(filters.sourceOrganism.toLowerCase()))
```







## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
