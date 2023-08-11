# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run (after running `npm install`):

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Choix techniques :
J'ai décidé d'utiliser bootstrap pour le framework css comme il est très largement répandu.

## Tester l’application : 
Une fois l’application lancée, vous pouvez la tester en important n’importe quel gltf  ou glb à l’aide du bouton dans le menu.
J’ai pris la décision de ne pouvoir loader qu’un seul gltf/glb à la fois pour qu’ils ne se superposent pas. Il faut donc supprimer le gltf à l’aide du bouton sur lequel il y a une corbeille avant de pouvoir en loader un autre.

## Difficultés rencontrées : 
Je savais dans l’ensemble à l’avance comment faire les différents points demandés. C’était des choses que j’avais déjà faites.
Sauf pour le dernier point “avancé”, le merge du gltf.

Ce dernier point m’a donc pris un peu plus de temps.
Je ne savais pas si le challenge un (celui impliquant le raycaster) devait être compatible avec le merge de l’objet. En effet, une fois tous les meshs mergés en un seul, il est compliqué de pouvoir sélectionner chaque objet dans le canvas.

Pour pouvoir présenter les deux points j’ai donc pris la décision de merger les objets au clique sur un bouton dans le menu, ce qui a pour conséquence de n’appliquer qu’un seul matériel sur l’objet et donc d’enlever les couleurs.

