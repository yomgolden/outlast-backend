const fs = require("fs");

const path = require("path");

const parseTemplate =
  require("../utils/placeholderParser");

const {
  randomItem
} = require("../utils/randomizer");

class EventEngine {

  constructor() {

    this.events = [];

    this.loadEvents();
  }

  loadEvents() {

    const eventsPath =
      path.join(
        __dirname,
        "../events"
      );

    const files =
      fs.readdirSync(eventsPath);

    files.forEach(file => {

      const raw =
        fs.readFileSync(
          path.join(
            eventsPath,
            file
          )
        );

      const parsed =
        JSON.parse(raw);

      this.events.push(
        ...parsed
      );
    });
  }

  generateEvent({
    victim,
    killer,
    tool,
    round,
    location
  }) {

    const event =
      randomItem(
        this.events
      );

    const parsedText =
      parseTemplate(
        event.text,
        {
          victim,
          killer,
          tool,
          round,
          location
        }
      );

    return {

      type:
        event.type,

      lethal:
        event.lethal,

      text:
        parsedText
    };
  }
}

module.exports =
  new EventEngine();
