import numpy as np
import itertools

def fast_floyd_warshall (A):
  """
  A must be a numpy matrix of distances.
  Thanks to numpy the execution of this algorithm is extremely fast.
  
  """
  n, _ = A.shape
  np.fill_diagonal(A, 0)  # diagonal elements should be zero
  
  for i in range(n):
      A = np.minimum(A, A[i, :][np.newaxis, :] + A[:, i][:, np.newaxis])
  
  return A
  
  
if __name__ == '__main__':
  A = np.random.random_integers(1, 30, (4,4))
  print("Matrix: ", A)
  print("After algorithm :", fast_floyd_warshall(A))
