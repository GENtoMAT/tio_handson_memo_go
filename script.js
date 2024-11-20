const titleElement = document.getElementById("id-title")
const bodyElement = document.getElementById("id-body")
const myModal = new bootstrap.Modal(document.getElementById("id-edit-modal")) //モーダルのインスタンスはグローバル変数として生成。最初に１つ作ってそれを適宜操作する
const addModal = new bootstrap.Modal(document.getElementById("id-add-modal")) //登録用のモーダル
const addButton = document.getElementById("id-add-button")
const titleInAddModal = document.getElementById("id-add-modal-title")
const bodyInAddModal = document.getElementById("id-add-modal-body")
const titleInEditModal = document.getElementById("id-modal-title")
const bodyInEditModal = document.getElementById("id-modal-body")
const validInAddModal = document.getElementById("id-validation-error-in-add-modal")
const validInEditModal = document.getElementById("id-validation-error-in-edit-modal")
const memoList = document.getElementById("id-memo-list")
const checkboxes = document.getElementById(getCheckboxClass())
const TITLE_MIN = 1
const TITLE_MAX = 300
const BODY_MIN = 1
const BODY_MAX = 10000

function createTitleInMemoListId(memoId) {
  return "id-title-in-list-" + memoId
}
function getEleByIdTitleInMemoList(memoId) {
  return document.getElementById(createTitleInMemoListId(memoId))
}
function createBodyInMemoListId(memoId) {
  return "id-body-in-list-" + memoId
}
function getEleByIdBodyInMemoList(memoId) {
  return document.getElementById(createBodyInMemoListId(memoId))
}
function createUpdatedAtInMemoListId(memoId) {
  return "id-updated-at-in-list-" + memoId
}
function getEleByIdUpdatedAtInMemoList(memoId) {
  return document.getElementById(createUpdatedAtInMemoListId(memoId))
}
function getEleByIdMemoInModal() {
  return document.getElementById("id-memo-id-in-modal")
}
function getCheckboxClass() {
  return "class-checkbox"
}

function isValidateMemoPassed(title, body, errorHTMLElement, memoId) {
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    errorHTMLElement.style.display = "" //ココにもdisplayを指定する必要あり。タイトルのみNGだったときにバリデを表示させるため
    errorHTMLElement.innerText = "タイトルは１文字以上、３０文字以内にしてください\n"
  }
  if (body.length < BODY_MIN || body.length > BODY_MAX) {
    errorHTMLElement.style.display = "" //innerTextの入れ子の前にdisplayを指定する必要あり。
    errorHTMLElement.innerText = errorHTMLElement.innerText + "本文は１文字以上、１００文字以内にしてください\n"
  }
  //バリデ：タイトル被り
  if (memoList.children.length > 0) {
    Array.from(memoList.children).forEach((tr) => {
      const t = getEleByIdTitleInMemoList(tr.id).innerText
      if (tr.id == memoId) {
        //同じIDのメモはスルーさせる
      } else if (title == t) {
        errorHTMLElement.style.display = "" //ココにもdisplayを指定する必要あり。タイトル被りのみNGだったときにバリデを表示させるため
        errorHTMLElement.innerText = errorHTMLElement.innerText + "すでに登録済みのタイトルです\n"
      }
    })
  }
  if (errorHTMLElement.innerText.length > 0) {
    errorHTMLElement.innerText = errorHTMLElement.innerText.slice(0, -1)
    return false
  }
  return true
}

//////ボタン「メモを登録」押下時の処理
addButton.addEventListener("click", (event) => {
  //登録モーダルの初期化
  titleInAddModal.value = ""
  bodyInAddModal.value = ""
  validInAddModal.style.display = "none"
  validInAddModal.innerText = ""
  addModal.show()
})

//ボタン「登録モーダル内の登録ボタン」押下時の処理
const addButtonInAddModal = document.getElementById("id-add-btn-in-add-modal")
addButtonInAddModal.addEventListener("click", (event) => {
  //入力された２つのデータをモーダルから取得
  const title = titleInAddModal.value
  const body = bodyInAddModal.value
  //入力文字数のチェック
  validInAddModal.innerText = ""
  //errorMessage.style.display = "" //ココにdisplayを指定するのNG。バリデを一発クリアしたときにバリデ枠がチラ見えする

  if (isValidateMemoPassed(title, body, validInAddModal, "") == false) {
    return
  }

  //メモリストに追加するデータの整形
  const now = new dayjs()
  const createdAt = now.format("YYYY-MM-DD HH:mm:ss")
  const updatedAt = "なし"
  const memoId = now.valueOf() //1970 年 1 月 1 日 00:00:00 UTC から現在までの経過時間のミリ秒。ユニーク値。ミリ秒で人が使うメモ帳だから成立してる。
  const editBtnId = "id-edit-btn-" + memoId
  const titleInListId = createTitleInMemoListId(memoId)
  const updatedAtId = createUpdatedAtInMemoListId(memoId)
  const tr = document.createElement("tr")
  tr.setAttribute("id", memoId)
  tr.innerHTML =
    '<td><input class="' +
    getCheckboxClass() +
    '" data-memomemo-id="' +
    memoId +
    '"type="checkbox" /></td><td id="' +
    titleInListId +
    '">' +
    title +
    "</td><td>" +
    createdAt +
    '</td><td id="' +
    updatedAtId +
    '">' +
    updatedAt +
    '</td><td><button type="button" data-memomemo-id="' +
    memoId +
    '" id="' +
    editBtnId +
    '" class="btn btn-primary">編集</button></td>'
  memoList.appendChild(tr)
  //メモの中味をhiddenのinput.valueに格納してtrの末尾に追加
  const inputForBody = document.createElement("input")
  inputForBody.setAttribute("id", createBodyInMemoListId(memoId))
  inputForBody.setAttribute("type", "hidden")
  inputForBody.value = body
  tr.appendChild(inputForBody)
  //動的に作ったボタンに対してaddEventListenerを張っていける
  //編集ボタンを押した時のモーダル呼び出し設定を張っていく
  const editBtn = document.getElementById(editBtnId)
  editBtn.addEventListener("click", (event) => {
    //編集モーダルの初期化
    validInEditModal.style.display = "none"
    validInEditModal.innerText = ""
    //タイトル、中味をHTMLから取ってくる
    const memoId = event.currentTarget.dataset.memomemoId
    getEleByIdMemoInModal().value = memoId //モーダルにmemoIdを埋め込んでおく
    const selectedMemoTitle = getEleByIdTitleInMemoList(memoId).innerText
    const selectedMemoBody = getEleByIdBodyInMemoList(memoId).value //中味はinputだからvalueでOK
    //２つのデータをモーダルに渡す
    const titleModalElement = titleInEditModal
    const bodyModalElement = bodyInEditModal
    titleModalElement.value = selectedMemoTitle
    bodyModalElement.value = selectedMemoBody
    myModal.show()
  })
  addModal.hide()
})

//////メモを削除
const dltBtn = document.getElementById("id-dlt-button")
dltBtn.addEventListener("click", () => {
  //checkboxes は冒頭で定義
  //const checkboxes = memoList.getElementsByTagName("input") //memoListのinputをサーチする方法でもOK
  Array.from(checkboxes).forEach((checkbox) => {
    if (checkbox.checked == false) {
      return false
    }
    const memoId = checkbox.dataset.memomemoId //データ属性特有の記法。dataset.で結んでidの頭data-を取ってハイフン消して頭文字大文字キャメルで連結させる。
    document.getElementById(memoId).remove() //原則memoIdとmemomemoIdは同じ値。IdでmemoIdを指定するとtrを引っ掛けれる。trをリムーブしてるので行ごと消せる。
  })
})

//////削除目的で全てのメモを選択
const dltAllMemos = document.getElementById("id-dlt-all-memos")
dltAllMemos.addEventListener("change", () => {
  //clickよりもchangeの方が適切
  //checkboxes は冒頭で定義
  console.log(checkboxes.length)
  //登録メモが０件の場合
  if (checkboxes.length == 0) {
    return
  }
  Array.from(checkboxes).forEach((checkbox) => {
    if (dltAllMemos.checked == false) {
      checkbox.checked = false
    } else {
    }
    checkbox.checked = true
  })
})

/////ボタン「編集モーダル上の更新ボタン」を押した時の処理
const updateMemoBtn = document.getElementById("id-update-btn")
updateMemoBtn.addEventListener("click", (event) => {
  const memoId = getEleByIdMemoInModal().value
  //編集後の２つのデータをモーダルから取得
  const title_edited = titleInEditModal.value
  const body_edited = bodyInEditModal.value
  //バリデ：入力文字数のチェック
  validInEditModal.innerText = ""

  if (isValidateMemoPassed(title_edited, body_edited, validInEditModal, memoId) == false) {
    return
  }

  //メモリスト上の元のメモデータを指定
  const selectedMemoTitle = getEleByIdTitleInMemoList(memoId)
  const selectedMemoBody = getEleByIdBodyInMemoList(memoId)
  //selectedMemoTitle = title_edited //selectedの最初の定義で.innerTextつけて、そのままtitleModalElementを代入するとエラーになる（Assignment to constant variable
  selectedMemoTitle.innerText = title_edited //ココでプロパティ追加指定すると通る
  selectedMemoBody.value = body_edited //中味はinputだからvalueでOK
  //更新日を処理する
  const now = new dayjs()
  const updatedAt = now.format("YYYY-MM-DD HH:mm:ss")
  getEleByIdUpdatedAtInMemoList(memoId).innerText = updatedAt
  myModal.hide()
})
