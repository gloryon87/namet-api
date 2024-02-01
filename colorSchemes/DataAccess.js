import colorSchemesSchema from "./schema.js"

class ColorSchemesDataAccess {
  async getColorSchemes() {
    return await ColorSchemes.find()
  }
}

export default ColorSchemesDataAccess


