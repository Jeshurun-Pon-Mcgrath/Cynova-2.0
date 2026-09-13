export default {
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "Node",
          target: "ES2023",
          esModuleInterop: true,
          isolatedModules: true,
        },
      },
    ],
  },
};
