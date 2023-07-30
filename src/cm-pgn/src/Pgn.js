/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-pgn
 * License: MIT, see file 'LICENSE'
 */
import { Header, TAGS } from "./Header.js";
import { History } from "./History.js";

export class Pgn {
  //   constructor(pgnString = "", props = {}) {
  //     // only the header?
  //     const lastHeaderElement =
  //       pgnString.trim().slice(-1) === "]"
  //         ? pgnString.length
  //         : pgnString.lastIndexOf("]\n\n") + 1;
  //     const headerString = pgnString.substring(0, lastHeaderElement);
  //     console.log("headerString: " + headerString);
  //     const historyString = pgnString.substring(lastHeaderElement);
  //     console.log("historyString: " + historyString);
  //     const sloppy = !!props.sloppy;
  //     this.header = new Header(headerString);
  //     if (this.header.tags[TAGS.SetUp] === "1" && this.header.tags[TAGS.FEN]) {
  //       this.history = new History(
  //         historyString,
  //         this.header.tags[TAGS.FEN],
  //         sloppy
  //       );
  //     } else {
  //       this.history = new History(historyString, null, sloppy);
  //     }
  //   }

  constructor(pgnString = "", props = {}) {
    const delimiterRegex = /]\s*\n\s*\n/;
    const delimiterMatch = pgnString.match(delimiterRegex);
    const lastHeaderElement = delimiterMatch
      ? delimiterMatch.index + 2
      : pgnString.length;
    const headerString = pgnString.substring(0, lastHeaderElement);
    console.log("headerString: " + headerString);
    const historyString = pgnString.substring(lastHeaderElement);
    console.log("historyString: " + historyString);
    const sloppy = !!props.sloppy;
    this.header = new Header(headerString);
    if (this.header.tags[TAGS.SetUp] === "1" && this.header.tags[TAGS.FEN]) {
      this.history = new History(
        historyString,
        this.header.tags[TAGS.FEN],
        sloppy
      );
    } else {
      this.history = new History(historyString, null, sloppy);
    }
  }

  wrap(str, maxLength) {
    const words = str.split(" ");
    let lines = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (line.length + word.length < maxLength) {
        line += word + " ";
      } else {
        lines.push(line.trim());
        line = word + " ";
      }
    }
    lines.push(line.trim());
    return lines.join("\n");
  }

  render(renderHeader = true, renderComments = true, renderNags = true) {
    const header = renderHeader ? this.header.render() + "\n" : "";
    let history = this.history.render(renderComments, renderNags);
    if (this.header.tags[TAGS.Result]) {
      history += " " + this.header.tags[TAGS.Result];
    }
    return header + this.wrap(history, 80);
  }
}
