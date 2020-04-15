(ns hw1.perceptron
  (:require [clojure.core.matrix :as m]))

(defn sign [num]
  (cond
    (< num 0) -1
    (> num 0) +1
    :else 0))

(defn include-bias
  [observation]
  (into [1] observation))

(defn classify
  [observation w]
  (sign (m/dot (m/transpose w)
               (include-bias observation))))

(defn get-misclassified-observations
  [train-data w]
  (->> (filter #(not= (classify (first %) w)
                      (second %))
               train-data)
       (vec)))

(defn train
  [train-data initial-weights]
  (loop [w initial-weights, iterations 0]
    (let [misclassified-pts (get-misclassified-observations train-data w)]
      (if-not (empty? misclassified-pts)
        (let [misclassified-pt (rand-nth misclassified-pts)
              x_i (include-bias (first misclassified-pt))
              y_i (second misclassified-pt)]
          (when-not (nil? misclassified-pt)
            (recur (m/add w (m/emul y_i x_i))
                   (inc iterations))))
        [w iterations]))))

(defn line
  [x1 y1 x2 y2]
  (fn [x] (+ (* (/ (- y2 y1) (- x2 x1))
                x)
             (- y1 (* (/ (- y2 y1) (- x2 x1))
                      x1)))))
(defn make-random-line
  []
  (let [x1 (- (rand 2) 1)
        y1 (- (rand 2) 1)
        x2 (- (rand 2) 1)
        y2 (- (rand 2) 1)]
    (line x1 x2 y1 y2)))

(defn get-point-wrt-line
  [x f]
  (sign (- (f (m/slice x 0))
           (m/slice x 1))))

(defn generate-random-observation
  [dim]
  (for [_ (range dim)]
    (- (rand 2) 1)))

(defn generate-random-observations
  [num dim]
  (vec (for [_ (range num)]
         (generate-random-observation dim))))

(defn run-pla
  [f N dim]
  (let [X (generate-random-observations N dim)
        w (m/zero-array [(inc dim)])
        D (map #(vector (vec %) (get-point-wrt-line % f)) X)]
    (train D w)))

(defn average
  [coll]
  (float (/ (reduce + coll) (count coll))))

(defn avg-iterations-to-converge
  [N]
  (let [n-runs 1000, dim 2]
    (average
      (for [_ (range n-runs)]
        (second (run-pla (make-random-line) N dim))))))

(defn calculate-prob
  [N]
  (->> (let [n-runs 1000, dim 2]
         (average
           (for [_ (range n-runs)]
             (let [f (make-random-line)
                   w (first (run-pla f N dim))]
               (average
                 (for [i (range 1000)]
                   (let [x (generate-random-observation dim)]
                     (if (= (classify x w)
                            (get-point-wrt-line x f))
                       1 0))))))))
       (- 1)))

(defn -main []
  (println "Q7:" (avg-iterations-to-converge 10))
  (println "Q8:" (calculate-prob 10))
  (println "Q9:" (avg-iterations-to-converge 100))
  (println "Q10:" (calculate-prob 100))
  )