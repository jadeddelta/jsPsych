import { clickTarget, flushPromises, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import cloze from ".";

jest.useFakeTimers();

const getInputElementById = (
  id: string,
  displayElement: HTMLElement
) => displayElement.querySelector("#" + id) as HTMLInputElement;

const clickFinishButton = (
  displayElement: HTMLElement
) => clickTarget(displayElement.querySelector("#finish_cloze_button"));

describe("cloze", () => {
  test("displays cloze", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    expect(getHTML()).toContain(
      '<div class="cloze">This is a <input type="text" id="input0" value=""> text.</div>'
    );

    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("displays default button text", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    expect(getHTML()).toContain(
      '<button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">OK</button>'
    );

    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("displays custom button text", async () => {
    const { getHTML, expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        button_text: "Next",
      },
    ]);

    expect(getHTML()).toContain(
      '<button class="jspsych-html-button-response-button" type="button" id="finish_cloze_button">Next</button>'
    );

    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("ends trial on button click when using default settings, i.e. answers are not checked", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
      },
    ]);

    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("ends trial on button click when answers are checked and correct", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
      },
    ]);

    getInputElementById("input0", displayElement).value = "cloze";
    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("ends trial on button click when answers are checked and correct without case sensitivity", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
        case_sensitivity: false,
      },
    ]);

    getInputElementById("input0", displayElement).value = "CLOZE";
    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("ends trial on button click when all answers are checked for completion and are complete", async () => {
    const { expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        allow_blanks: false,
      },
    ]);

    getInputElementById("input0", displayElement).value = "filler";
    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("does not end trial on button click when answers are checked and not correct or missing", async () => {
    const { expectRunning, expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
      },
    ]);

    getInputElementById("input0", displayElement).value = "some wrong answer";
    await clickFinishButton(displayElement);
    await expectRunning();

    getInputElementById("input0", displayElement).value = "";
    await clickFinishButton(displayElement);
    await expectRunning();

    getInputElementById("input0", displayElement).value = "cloze";
    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("does not call mistake function on button click when answers are checked and correct", async () => {
    const mistakeFn = jest.fn();

    const { expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0", displayElement).value = "cloze";
    await clickFinishButton(displayElement);
    expect(mistakeFn).not.toHaveBeenCalled();

    await expectFinished();
  });

  test("does not call mistake function on button click when answers are checked for completion and are complete", async () => {
    const mistakeFn = jest.fn();

    const { expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        allow_blanks: false,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0", displayElement).value = "cloze";
    await clickFinishButton(displayElement);
    expect(mistakeFn).not.toHaveBeenCalled();

    await expectFinished();
  });

  test("calls mistake function on button click when answers are checked and not correct or missing", async () => {
    const mistakeFn = jest.fn();

    const { expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text.",
        check_answers: true,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0", displayElement).value = "some wrong answer";
    await clickFinishButton(displayElement);
    expect(mistakeFn).toHaveBeenCalled();

    mistakeFn.mockReset();

    getInputElementById("input0", displayElement).value = "";
    await clickFinishButton(displayElement);
    expect(mistakeFn).toHaveBeenCalled();

    getInputElementById("input0", displayElement).value = "cloze";
    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("calls mistake function on button click when answers are checked and do not belong to a multiple answer blank", async () => {
    const mistakeFn = jest.fn();

    const { expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze/jspsych% text.",
        check_answers: true,
        mistake_fn: mistakeFn,
      },
    ]);

    getInputElementById("input0", displayElement).value = "not fitting in answer";
    await clickFinishButton(displayElement);
    expect(mistakeFn).toHaveBeenCalled();

    getInputElementById("input0", displayElement).value = "cloze";
    await clickFinishButton(displayElement);
    await expectFinished();
  });

  test("response data is stored as an array", async () => {
    const { getData, expectFinished, displayElement } = await startTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text. Here is another cloze response box %%.",
      },
    ]);

    getInputElementById("input0", displayElement).value = "cloze1";
    getInputElementById("input1", displayElement).value = "cloze2";
    await clickFinishButton(displayElement);
    await expectFinished();

    const data = getData().values()[0].response;
    expect(data).toEqual(["cloze1", "cloze2"]);
  });
});

describe("cloze simulation", () => {
  test("data-only mode works", async () => {
    const { getData, expectFinished } = await simulateTimeline([
      {
        type: cloze,
        text: "This is a %cloze% text. Here is another cloze response box %%.",
      },
    ]);

    await expectFinished();

    const response = getData().values()[0].response;
    expect(response[0]).toBe("cloze");
    expect(response[1]).not.toBe("");
  });
  test("visual mode works", async () => {
    const { getData, expectFinished, expectRunning } = await simulateTimeline(
      [
        {
          type: cloze,
          text: "This is a %cloze% text. Here is another cloze response box %%.",
        },
      ],
      "visual"
    );

    await expectRunning();

    jest.runAllTimers();

    await expectFinished();

    const response = getData().values()[0].response;
    expect(response[0]).toBe("cloze");
    expect(response[1]).not.toBe("");
  });
});
