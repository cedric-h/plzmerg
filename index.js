const express = require('express');
const app = express();
const port = 3013;

app.use(require('cookie-session')({
  secret: '1337 h4x0r'
}));

const background = require("fs").readFileSync("public/background.js");

const basicDoc = payload => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      document, body {
        margin: 0px;
        padding: 0px;
        overflow: hidden;
      }
    </style>
    <link rel="stylesheet" media="screen" href="https://fontlibrary.org//face/pixelated" type="text/css"/>
  </head>
  <body>
    ${payload}
  </body>
</html>
`;

app.use(express.static('public'))

const hcers = JSON.parse(require("fs").readFileSync("hcers.json", "utf-8"));
const saveHcers = () => 
  require("fs")
      .writeFileSync("hcers.json", JSON.stringify(hcers), "utf-8")

function *makeInteraction(intro, save) {
  do {
    save.intros = [
      yield [
        intro,
        save.intros[0],
        "leeza"
      ],
      yield [
        `great! what's another way she 
          might want to ask you that?
          sillier, perhaps?`,
        save.intros[1],
        "leeza"
      ],
    ];
  } while (
    !(yield *yesno(`great, so she might say
      -> "${save.intros[0]}"
      or
      -> "${save.intros[1]}"
      yeah? (y/n)
    `))
  );

  do {
    save.prompt = yield [
      `awesome!
      so eleeza asks something like:
      -> "${save.intros[0]}"
      or
      -> "${save.intros[1]}"

      how do you respond?
      `,
      save.prompt,
      "you"
    ];

    save.promptOpts = {
      bad: yield [
        `okay, so you tell eleeza:
         -> #${save.prompt}#

         what's a retort eleeza could make that
          might sting a little bit?`,
        save.promptOpts.bad,
        "leeza"
      ],
      good: yield [
        `alright, but on other hand, after:
         -> #${save.prompt}#

          what response could she make that you
          would be less chagrined to hear?`,
        save.promptOpts.good,
        "leeza"
      ],
    };
  } while (
    !(yield *yesno(`okay, so you say:

      -> #${save.prompt}#

      and she can lose points with you by saying:
      -> "${save.promptOpts.bad}"

      or gain points with you by saying:
      -> "${save.promptOpts.good}"

      right? (y/n)
    `))
  );

  do {
    save.badAnswerRes = yield [
      `okay, eleeza upsets you by saying
        -> "${save.promptOpts.bad}"

        what could you say to salvage the conversation?
      `,
      save.badAnswerRes,
      "you"
    ]

    save.badAnswerOpts = {
      good: yield [
        `okay, eleeza upsets you by saying
          -> "${save.promptOpts.bad}"

          and you say
          -> #${save.badAnswerRes}#

          what could she say to redeem herself?`,
        save.badAnswerOpts.good,
        "leeza"
      ],
      bad: yield [
        `alright, what could she say after
          the less-than-inspirational
          -> "${save.promptOpts.bad}"

          when you responded with
          -> #${save.badAnswerRes}#

          that would only make things even worse?`,
        save.badAnswerOpts.bad,
        "leeza"
      ],
    };
  } while(
    !(yield *yesno(`okay, so eleeza starts things
      off on the wrong foot with:
      -> "${save.promptOpts.bad}"

      so you say:
      -> #${save.badAnswerRes}#

      and eleeza either patches things up with:
      -> "${save.badAnswerOpts.good}"

      or makes you purse your lips with:
      -> "${save.badAnswerOpts.bad}"

      righto? (y/n)
    `))
  );

  yield `awesome! let's now consider the
         more pleasant conversational possibility.`

  do {
    save.goodAnswerRes = yield [
      `say eleeza shares this intriguing insight:
        -> "${save.promptOpts.good}"

        how do you proceed?
      `,
      save.goodAnswerRes,
      "you"
    ]

    save.goodAnswerOpts = {
      bad: yield [
        `okay, eleeza inspires you by saying
          -> "${save.promptOpts.good}"

          and you respond
          -> #${save.goodAnswerRes}#

          what could she say to sour the moment?`,
        save.goodAnswerOpts.bad,
        "leeza"
      ],
      good: yield [
        `alright, but what if after
          -> "${save.promptOpts.good}"

          when you responded with
          -> #${save.goodAnswerRes}#

          she said something a bit nicer instead?`,
        save.goodAnswerOpts.good,
        "leeza"
      ],
    };
  } while(
    !(yield *yesno(`awesome, so let's see if I have it all straight,
      eleeza says something nice, like:
      -> "${save.promptOpts.good}"

      so you say:
      -> #${save.goodAnswerRes}#

      and eleeza either turns sweet into bittersweet with:
      -> "${save.goodAnswerOpts.bad}"

      or exudes most exuberant vibes with:
      -> "${save.goodAnswerOpts.good}"

      so good so far? (y/n)
    `))
  );
}

function *makeMorningInteraction(save) {
  yield *makeInteraction(
    `one morning, eleeza gets curious about
      what you're working on.
      how might she ask you about that?`,
    save.morning
  );
}

function *makeAfternoonInteraction(save) {
  yield `that was fun, no?

    a few hours later, in the afternoon, eleeza reaches out
    to you again. this time, it's not about what you've been
    working on, but something else entirely.
  `;

  yield *makeInteraction(
    `perhaps what you're doing for fun, or making to eat?
     what does eleeza say in her message?`,
     save.afternoon
  );
}

function *makeFinalInteraction(save) {
  save.final.bestCase = yield [
    `great! you're almost done.
      at the end of the day, eleeza sends you a
      link to a pull request she made on one of
      your open source projects.

      it riddles the project with allusions to DEB,
      gives it a "dark academia" aesthetic, and 
      matching soundtrack.

      if all of your interactions with eleeza have
      been extremely pleasant recently, how do you
      react to the request?
    `,
    save.final.bestCase,
    "you"
  ];

  save.final.mediocre = yield [
    `excellent. and if your interactions
      with eleeza have been, on balance, mediocre?`,
    save.final.mediocre,
    "you"
  ];

  save.final.worstCase = yield [
    `and now it is time to sharpen your fangs.
      if your interactions with eleeza have
      illicited the full force of your wrath,
      what horrors do you unleash?`,
    save.final.worstCase,
    "you"
  ];

  save.name = yield [
    `truly awe-inspiring.
      now tell me, hacker ... who are you?`,
    save.name,
    "you"
  ];

  for (let i = 0; i < 3; i++)
    save.frens[i] = yield [
      `one last bit of information is required
        to add your most authentic self to our sim.

        please identify 3 hack clubbers
        you enjoy collaborating with,
        that you might respect eleeza
        more for fraternizing with.

        hack club fren (${i+1}/3)`,
      save.frens[i],
      "you"
    ];

  if (!(yield *yesno(`in review:

    eleeza's pull request's best case scenario:
    -> #${save.final.bestCase}#

    eleeza's pull request's most likely outcome:
    -> #${save.final.mediocre}#

    eleeza's pull request when met with your ire:
    -> #${save.final.worstCase}#

    you: #${save.name}#, frens: #${save.frens.join(", ")}#

    looks good? (y/n)
  `)))
    makeFinalInteraction(save);
}

function *makeInteractions(save) {
  yield *makeMorningInteraction(save);
  yield *makeAfternoonInteraction(save);
  yield *makeFinalInteraction(save);
}

function *yesno(q) {
  let answer;
  while (!["y", "yes", "n", "no"].includes(answer = yield q))
    ;
  return answer == "y" || answer == "yes";
}


function *seshGen() {
  while (true) {
    let msg = yield `
      commands:
      "play" - from the top!                
      "add" - add yourself as a character!  
      "edit" - see/edit all characters!     
    `;
    console.log(msg);
    const opts = { play, add, edit };

    if (opts[msg]) yield *opts[msg]();
  }

  function *add() {
    const save = JSON.parse(JSON.stringify(hcers.ced));

    yield `sup nerds. its me, ced!
      i trust you've come here to be added to the sim?
      worry not, for it is a simple process!

      all you need to do are answer some hypothetical questions
      about a fictional conversation between #you# and "eleeza"!

      press enter to continue.
    `;

    yield `my answers to these questions are supplied as defaults to
      get your creative juices flowing, but I'm not sure I did
      a great job of #staying in character# as eleeza.

      maybe you can do better! to clear out my
      responses immediately,
      just use "shift + backspace".
    `,

    yield *makeInteractions(save);

    hcers[save.name] = save;
    saveHcers();

    yield `great, you're all done!
      your character should exist in the edit page,
      as well as in the game itself!`;
  }

  function *chooseHcer(verb) {
    let names = Object.keys(hcers);

    let msg = `which Hack Clubber would you like ${verb}?\n`;
    const ROW_SIZE = 3;
    while (names.length)
      msg += names.splice(0, ROW_SIZE).join(", ") + "\n";
    console.log('making msg for chooseHcer', names, msg);

    names = Object.keys(hcers);
    let name;
    while (!hcers[name = yield msg])
      ;
    return hcers[name];
  }

  function *choose(prompt, opts) {
    opts = Object.entries(opts)
      .sort(_ => 0.5 - Math.random())
      .map(([key, val]) => ({ key, val }));
    let msg = `${prompt}

    "0 - ${opts[0].val}"

    #1 - ${opts[1].val}#`;

    let select;
    while (!(select = opts[yield msg]))
      ;
    return select;
  }

  function *play() {
    const alreadyMet = new Set();

    const scoreboard = new Map();
    const boostScore = (name, boost) =>
      scoreboard.set(name, (scoreboard.get(name) ?? 0) + boost);

    function *interact(stageName) {
      let save;
      do {
        save = yield* chooseHcer("to talk to");
      } while (
        alreadyMet.has(save.name) &&
          !(yield `${save.name}'s offline right now. maybe try again in a bit?`)
      );
      let stage = save[stageName];

      while (!stage.intros[yield `"0 - ${stage.intros[0]}",

        #1 - ${stage.intros[1]}#`]);

      const select = yield* choose(stage.prompt, stage.promptOpts);

      const nextSelect = yield* choose(
        stage[select.key + "AnswerRes"],
        stage[select.key + "AnswerOpts"],
      );

      const favor = Math.sign((    select.key == "good") - 0.5) +
                    Math.sign((nextSelect.key == "good") - 0.5);

      if (favor == 2)
        yield `${save.name} reacts with a :yay: emoji \nand then goes offline.`;
      else if (favor == -2)
        yield `${save.name} reacts with a :angery: emoji \nand then goes offline.`;
      else
        yield `${save.name} reacts with an :eyes: emoji \nand then goes offline.`;

      alreadyMet.add(save.name);

      boostScore(save.name, favor);

      for (const fren of save.frens)
        boostScore(fren, Math.sign(favor));
    }

    yield `eleeza yawns and stretches.

      how about some silly creative
      inspiration to start the day?

      let's see who's on the Slack!`;

    for (let i = 0; i < 2; i++) yield* interact('morning');
    alreadyMet.clear();

    yield `the sun reaches its zenith ...`;

    for (let i = 0; i < 2; i++) yield* interact('afternoon');

    yield `geez, how time is slipping by ...
      eleeza feels she'd better not
      let this day go to waste!

      contributing to someone's open source
      project feels like a surefire way to
      make something of the day ...
      
      which hack clubber will she collaborate with?
      choose carefully! hack clubbers who you haven't
      schmoozed enough may not feel too keen about
      merging your pull request!`;

    const save = yield* chooseHcer("to collab with");

    yield `you begin hacking on ${save.name}'s project,

      riddling the project with allusions to DEB,
      giving it a "dark academia" aesthetic, and 
      matching soundtrack ...

      as you bring your modifications to a close,
      you begin to worry ... will your contributions
      be accepted after all?
      
      tenatively, you dm them a link to your pull request ...
    `;

    let msg;
    if (scoreboard.get(save.name) >= 4)
      msg = save.final.bestCase;
    else if (scoreboard.get(save.name) <= -4)
      msg = save.final.worstCase;
    else
      msg = save.final.mediocre;

    yield `${save.name} ${msg}

    THE END`;
  }

  function *edit() {
    const save = yield* chooseHcer("to edit");
    let oldName = save.name;

    yield *makeInteractions(save);

    yield `great, you're all done!
      your changes should have taken effect!`;

    delete hcers[oldName]
    hcers[save.name] = save;

    saveHcers();
  }
}

let seshes = {};
app.get('/', (req, res) => {
  let sesh = (seshes[req.session.id ||= "" + new Date()] ||= seshGen());
  const url = new URL("http://example.com" + req.url);
  const params = new URLSearchParams(url.search);

  const next = input => {
    let ret = (() => {
      console.log("input", '"' + input + '"');
      const raw = sesh.next(input).value

      if (typeof raw == "string")
        return { prompt: raw, input: "", writingFor: "leeza" };
      if (Array.isArray(raw))
        return { prompt: raw[0], input: raw[1], writingFor: raw[2] };
      throw new Error(`we don't yet handle sesh returns like "${raw}"`);
    })();
    console.log(ret);
    ret.input = ret.input.split("\n").map(x => x.trim()).join("\n").trim();
    return ret;
  }

  if ([...params].length) {
    req.session.next = next(params.get("input"));
    return res.redirect("/plzmerg");
  }

  let title = false, lines = req.session.next;
  if (!lines) title = true, lines = next();

  console.log("lines", JSON.stringify(lines));
  res.send(basicDoc(`
    <canvas></canvas>
    <script type="module">
      ${background}
      render(${JSON.stringify({ title, lines })});
    </script>
  `))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
