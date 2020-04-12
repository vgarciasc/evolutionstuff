(ns hw1.sketch
  (:require [quil.core :as q]))

(defn setup []
  {})

(defn draw [state]
  (q/background 255)
  (q/rect 0 0 50 50))
