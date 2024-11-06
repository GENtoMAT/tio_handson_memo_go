package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("start")
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
	fmt.Println("successfull end")
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "helloooooo")
}
