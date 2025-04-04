module.exports = {
    content: [
      "./components/**/*.{js,vue,ts}",
      "./layouts/**/*.vue",
      "./pages/**/*.vue",
      "./plugins/**/*.{js,ts}",
      "./nuxt.config.{js,ts}",
      "./app.vue",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#0F766E",
          secondary: "#0EA5E9",
          accent: "#8B5CF6",
          background: "#F8FAFC",
          textColor: "#0F172A"
        },
        fontFamily: {
          heading: ['Poppins', 'sans-serif'],
          body: ['Inter', 'sans-serif']
        }
      },
    },
    plugins: [],
  }