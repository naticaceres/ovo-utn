export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bug
        'docs', // Documentación
        'style', // Cambios de formato (espacios, comas, etc.)
        'refactor', // Refactorización de código
        'perf', // Mejoras de rendimiento
        'test', // Agregar o corregir tests
        'chore', // Tareas de mantenimiento
        'ci', // Cambios en CI/CD
        'build', // Cambios en build system
        'revert', // Revertir commits anteriores
      ],
    ],
    'type-case': [2, 'always', 'lower'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
  },
};
