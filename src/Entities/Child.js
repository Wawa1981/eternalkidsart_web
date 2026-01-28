{
  "name": "Child",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Pr\u00e9nom de l'enfant"
    },
    "birth_date": {
      "type": "string",
      "format": "date",
      "description": "Date de naissance"
    },
    "avatar_url": {
      "type": "string",
      "description": "Photo ou avatar de l'enfant"
    },
    "favorite_colors": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Couleurs pr\u00e9f\u00e9r\u00e9es"
    }
  },
  "required": [
    "name"
  ]
}
