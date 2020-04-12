(ns hw1.core
  (:require [quil.core :as q]
            [quil.middleware :as m]
            [hw1.sketch :as s]))

;(q/defsketch pla-sketch
;             :size [400 300]
;             :setup s/setup
;             :draw s/draw
;             ;:update update
;             ;:mouse-moved mouse-moved
;             :middleware [m/fun-mode])