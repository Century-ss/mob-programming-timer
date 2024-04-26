import * as vscode from 'vscode'

let isInProgress: boolean = false

export function activate(context: vscode.ExtensionContext) {
  const startButtonText: string = 'Mob start'
  let intervalTime: number

  const startButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)
  startButton.command = 'mob-programming-timer.start'
  startButton.text = startButtonText
  startButton.show()

  const stopButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0)
  stopButton.command = 'mob-programming-timer.finish'
  stopButton.text = 'Mob finish'

  const startDisposable = vscode.commands.registerCommand(
    'mob-programming-timer.start',
    async () => {
      isInProgress = true

      const inputIntervalTime = await vscode.window.showInputBox({
        title: 'How often do you change drivers in minutes?',
      })

      intervalTime = validateInputIntervalTime(inputIntervalTime)

      startMobTimer({
        intervalTime: intervalTime,
        startButton: startButton,
        stopButton: stopButton,
      })
    }
  )

  const restartDisposable = vscode.commands.registerCommand('mob-programming-timer.restart', () => {
    stopButton.hide()
    vscode.window
      .showInformationMessage("👨‍💻🔄👩‍💻 It's time to switch.", 'Start next mob', 'Finish mob')
      .then((value) => {
        if (value === 'Start next mob') {
          startMobTimer({
            intervalTime: intervalTime,
            startButton: startButton,
            stopButton: stopButton,
          })
        } else if (value === 'Finish mob') {
          vscode.commands.executeCommand('mob-programming-timer.finish')
        }
      })
  })

  const stopDisposable = vscode.commands.registerCommand('mob-programming-timer.finish', () => {
    isInProgress = false
    stopButton.hide()
    startButton.text = startButtonText
  })

  context.subscriptions.push(startButton)
  context.subscriptions.push(stopButton)
  context.subscriptions.push(startDisposable)
  context.subscriptions.push(stopDisposable)
  context.subscriptions.push(restartDisposable)
}

export function deactivate() {}

const getDisplayTime = (minute: number, second: number): string => {
  return String(minute) + ':' + String(second).padStart(2, '0')
}

const zenkakuToHankaku = (word: string): string => {
  return word.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s: string) {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  })
}

const getRemainingMinuteAndSecond = (intervalTime: number): [number, number] => {
  // return [intervalTime, 0]
  // TODO: 一旦、デバッグしやすいように秒数にしているが、後で分に変更する
  return [0, intervalTime]
}

export const validateInputIntervalTime = (inputIntervalTime: string | undefined): number => {
  if (inputIntervalTime === undefined) {
    throw new Error('Please set the rotation time.')
  }
  if (isNaN(parseInt(zenkakuToHankaku(inputIntervalTime)))) {
    throw new Error('Please enter an integer.')
  }
  if (parseInt(zenkakuToHankaku(inputIntervalTime)) === 0) {
    throw new Error('Please enter an integer greater than zero.')
  }
  return parseInt(zenkakuToHankaku(inputIntervalTime))
}

type startMobTimerType = {
  intervalTime: number
  startButton: vscode.StatusBarItem
  stopButton: vscode.StatusBarItem
}

export const startMobTimer = ({
  intervalTime,
  startButton,
  stopButton,
}: startMobTimerType): void => {
  let minute: number
  let second: number
  ;[minute, second] = getRemainingMinuteAndSecond(intervalTime)

  startButton.text = getDisplayTime(minute, second)
  stopButton.show()

  const intervalId = setInterval(() => {
    if (!isInProgress) {
      clearInterval(intervalId)
      return
    }

    if (minute === 0 && second === 0) {
      clearInterval(intervalId)
      vscode.commands.executeCommand('mob-programming-timer.restart')
      return
    }

    if (second === 0) {
      second = 60
      minute = minute - 1
    } else {
      second = second - 1
    }

    startButton.text = getDisplayTime(minute, second)
  }, 1 * 1000)
}
