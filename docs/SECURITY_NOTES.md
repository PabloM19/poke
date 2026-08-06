# Notas de seguridad y dependencias

## React Router

El 6 de agosto de 2026 `npm audit --omit=dev` informa de una vulnerabilidad de
severidad alta en el modo RSC/Server Actions de React Router. PokéApp es una SPA
cliente con `createBrowserRouter`: no usa React Server Components, acciones de
servidor, SSR ni endpoints de React Router.

Se mantiene `react-router-dom@7.18.2`, la versión más reciente probada durante
esta fase, y se documenta la excepción hasta que exista una versión que cierre
el aviso sin reintroducir las vulnerabilidades que afectan a versiones
anteriores.

Esta excepción debe revisarse al actualizar dependencias. No autoriza a añadir
RSC, SSR o Server Actions sin una nueva evaluación.
