(ns hw1.perceptron-test
  (:require [clojure.test :refer :all]
            [hw1.perceptron :refer :all]
            [clojure.core.matrix :as m]))

(deftest sign-test
  (is (= (sign 3) +1))
  (is (= (sign -2) -1))
  (is (= (sign 0) 0)))

(deftest classify-test
  (are [data result] (= (apply classify data) result)
                     [[1] (m/transpose [5 7])] 1
                     [[1] (m/transpose [-8 7])] -1
                     [[1] (m/transpose [-7 7])] 0
                     [[2 7] (m/transpose [-49 7 5])] 0
                     [[1 0] (m/transpose [-5 5 5000])] 0))

(deftest get-misclassified-observations-test
  (is (= (get-misclassified-observations
           [[[2] 1] [[1] 0]] (m/transpose [-5 7]))
         [[[1] 0]]))
  (is (= (get-misclassified-observations
           [[[2] 0] [[1] 0]] (m/transpose [-5 7]))
         [[[2] 0] [[1] 0]])))

(deftest train-test
  (is (= (m/shape (train [[[2] 1] [[1] 0]]
                         (m/transpose [0 0])))
         [2])))
