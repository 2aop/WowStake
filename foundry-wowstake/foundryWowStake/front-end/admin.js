import { ethers } from "./ethers-6.7.esm.min.js"
import { abi, contractAddress } from "./constants.js"
const poolListButton = document.getElementById("poolListButton")
const addPoolButton = document.getElementById("addPoolButton")
const addPoolSubmitBtn = document.getElementById("addPoolSubmitBtn")
const addPoolCancelBtn = document.getElementById("addPoolCancelBtn")

const poolWeightNumber = document.getElementById("poolWeight")
const addPoolModal = document.getElementById("addPoolModal")

const minDeposit = document.getElementById("minDepositAmount")
const tokenAddress = document.getElementById("stTokenAddress")

poolListButton.onclick = getPoolList

let stakePoolList = [] // 声明一个空数组
addPoolButton.addEventListener("click", function () {
  addPoolModal.style.display = "flex" // 显示模态框
})
addPoolCancelBtn.addEventListener("click", function () {
  addPoolModal.style.display = "none" // 显示模态框
})

addPoolSubmitBtn.addEventListener("click", function () {
  addPoolModal.style.display = "none" // 隐藏模态框

  if (
    poolWeightNumber.value.trim() === "" ||
    minDeposit.value.trim() === "" ||
    tokenAddress.value.trim() === ""
  ) {
    alert("all  can not be blank")
    return
  }
  // 获取输入框的值
  const poolWeight = parseInt(poolWeightNumber.value)
  const minDepositAmount = parseInt(minDeposit.value)
  const stTokenAddress = tokenAddress.value

  addPool(poolWeight, minDepositAmount, stTokenAddress)
})

async function addPool(poolWeight, minDepositAmount, stTokenAddress) {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const blockNumber = await provider.getBlockNumber()
    console.log("Current block number:", blockNumber)
    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log(contract)
    try {
      console.log("Processing transaction...")
      const transactionResponse = await contract.addPool(
        poolWeight,
        ethers.parseEther(minDepositAmount.toString()),
        ethers.getAddress(stTokenAddress)
      )
      console.log("Done!")
    } catch (error) {
      console.log(error)
      alert("you are not onduty owner")
    }
  }
}

async function getPoolList() {
  console.log(`getPoolList...`)

  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const blockNumber = await provider.getBlockNumber()
    console.log("Current block number:", blockNumber)
    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log(contract)
    try {
      console.log("Processing transaction...")
      const transactionResponse = await contract.getAllPoolDetail()
      console.log(transactionResponse)
      stakePoolList = transactionResponse
      const tbody = document.querySelector("#pool-table tbody")
      tbody.innerHTML = ""
      transactionResponse.forEach((item, index) => {
        const row = document.createElement("tr")
        // 创建表格单元格并填充数据
        const indexCell = document.createElement("td")
        indexCell.textContent = index // 索引列
        row.appendChild(indexCell)

        const stTokenAddress = document.createElement("td")
        stTokenAddress.textContent = item.stTokenAddress
        row.appendChild(stTokenAddress)

        const poolWeight = document.createElement("td")
        poolWeight.textContent = item.poolWeight
        row.appendChild(poolWeight)

        const stTokenAmount = document.createElement("td")
        stTokenAmount.textContent = ethers.formatEther(item.stTokenAmount)
        row.appendChild(stTokenAmount)

        const minDepositAmount = document.createElement("td")
        minDepositAmount.textContent = ethers.formatEther(item.minDepositAmount)
        row.appendChild(minDepositAmount)

        const unstakeLockedBlocks = document.createElement("td")
        unstakeLockedBlocks.textContent = item.unstakeLockedBlocks
        console.log(item.stTokenAddress)
        row.appendChild(unstakeLockedBlocks)

        tbody.appendChild(row)
      })
      console.log(transactionResponse)

      console.log("Done!")
    } catch (error) {
      console.log(error)
    }
  }
}
