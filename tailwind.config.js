module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      boxShadow: {
        lucas: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        product: "rgba(0, 0, 0, 0.25) 0px 4px 4px",
      },
      colors: {
        "green-alt": {
          800: "#416832",
        },
        pinky: "#FECDD2",
        greeny: "#C8E6C9",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      backgroundColor: ["checked"],
      borderColor: ["checked"],
    },
  },
  plugins: [],
};
