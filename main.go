package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	// "html/template"
)

// 今回はココの変数で値をサーバー内に保存している。関数外で変数は宣言できるが値の代入するとエラーになる
var count int      //countの数字
var num_access int //アクセスされた回数
var htmlStr string

func main() {
	fmt.Println("serving start")
	count = 0
	num_access = 0
 	data, err := os.ReadFile("./static/memo_go.html") //ReadFile()　でファイル読み込み。読み込み成功したらdataに渡る＆err=nilに。失敗したらerr=エラーデータ。
		//gethtmlメソッドの中からココに移植。あそこだと関数呼ばれるたびにReadfileしてしまってる。一回読めばOK。
	//javascriptは返り値を１つしか渡せないが、Goは複数個可能。
	if err != nil {
		//fmt.Fprintln(w, "can't read the file")
		log.Fatal(err) //Fatal関数で「ココで処理を終わらせてerrを出力する」
	}
	htmlStr = string(data) //data変数をどこかで使わないと「定義してるが未使用」でエラーになるのでこの形に。

	//http.Handle("/", http.FileServer(http.Dir("./")))
	//http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("/"))))

	http.Handle("/static/", http.StripPrefix("/static", http.FileServer(http.Dir("./static/"))))
	//http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./"))))


	http.HandleFunc("/", getIndexHTML)
	http.HandleFunc("/getindexhtml", getIndexHTML)
	http.HandleFunc("/countup", countUp)
	http.HandleFunc("/getnow", getNow)
	http.ListenAndServe("localhost:8080", nil)
	fmt.Println("successfull end")
}

func getIndexHTML(w http.ResponseWriter, r *http.Request) {
	num_access++
	fmt.Println("access", num_access)
	fmt.Fprintln(w, htmlStr) //dataはbyte型なのでキャストが必要

	//tmpl := template.Must(template.ParseFiles("./memo_go.html"))
	//tmpl.Execute(w,"")
}

func countUp(w http.ResponseWriter, r *http.Request) {
	num_access++
	count++
	fmt.Println("access", num_access, "countup", count)
	fmt.Fprintln(w, count)
}

func getNow(w http.ResponseWriter, r *http.Request) {
	num_access++
	fmt.Println("access", num_access, "getnow", count)
	fmt.Fprintln(w, count)
}
